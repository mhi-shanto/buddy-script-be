import z from 'zod';
import mongoose from 'mongoose';
import { Comment } from '../models/comment.model';
import { Like } from '../models/like.model';
import { Post } from '../models/post.model';
import { IReply, Reply } from '../models/reply.model';
import { IUser } from '../models/user.model';
import { PaginatedResult } from '../types/pagination.type';
import { createReplySchema, updateReplySchema } from '../validation/reply.validation';
import { paginationSchema } from '../validation/pagination.validation';
import { ApiError } from '../utils/apiError';
import { getSkip, toPaginatedResult } from '../utils/pagination.util';
import { getLikedReplyIds } from './like.service';
import { SafeUser } from './user.service';

export interface SafeReply {
  id: string;
  comment: string;
  author: SafeUser;
  text: string;
  likesCount: number;
  hasLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type PopulatedReply = Omit<IReply, 'author'> & { author: IUser };

const AUTHOR_SELECT = 'firstName lastName email avatar createdAt updatedAt';

const toSafeUser = (user: IUser): SafeUser => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const toSafeReply = (reply: PopulatedReply, hasLiked: boolean): SafeReply => ({
  id: reply._id.toString(),
  comment: reply.comment.toString(),
  author: toSafeUser(reply.author),
  text: reply.text,
  likesCount: reply.likesCount,
  hasLiked,
  createdAt: reply.createdAt,
  updatedAt: reply.updatedAt,
});

const assertPostAccessible = async (postId: string, requesterId: string): Promise<void> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found!');
  }
  if (post.visibility === 'PRIVATE' && post.author.toString() !== requesterId) {
    throw new ApiError(403, 'You do not have access to this post!');
  }
};

const assertCommentAccessible = async (commentId: string, requesterId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, 'Comment not found!');
  }
  await assertPostAccessible(comment.post.toString(), requesterId);
  return comment;
};

const toSafeRepliesWithLikeState = async (
  replies: PopulatedReply[],
  requesterId: string,
): Promise<SafeReply[]> => {
  const replyIds = replies.map((reply) => reply._id.toString());
  const likedReplyIds = await getLikedReplyIds(requesterId, replyIds);
  return replies.map((reply) => toSafeReply(reply, likedReplyIds.has(reply._id.toString())));
};

export const createReply = async (
  commentId: string,
  authorId: string,
  payload: z.infer<typeof createReplySchema>,
): Promise<SafeReply> => {
  await assertCommentAccessible(commentId, authorId);

  const reply = await Reply.create({
    comment: commentId,
    author: authorId,
    text: payload.text,
  });

  await Comment.findByIdAndUpdate(commentId, { $inc: { repliesCount: 1 } });

  const populatedReply = await Reply.findById(reply._id).populate<{ author: IUser }>(
    'author',
    AUTHOR_SELECT,
  );
  if (!populatedReply || !populatedReply.author || typeof populatedReply.author === 'string') {
    throw new ApiError(404, 'Reply not found!');
  }

  return toSafeReply(populatedReply as unknown as PopulatedReply, false);
};

export const getRepliesByComment = async (
  commentId: string,
  requesterId: string,
  pagination: z.infer<typeof paginationSchema>,
): Promise<PaginatedResult<SafeReply>> => {
  await assertCommentAccessible(commentId, requesterId);

  const { page, limit } = pagination;
  const filter = { comment: commentId };

  const [replies, total] = await Promise.all([
    Reply.find(filter)
      .populate<{ author: IUser }>('author', AUTHOR_SELECT)
      .sort({ createdAt: 1 })
      .skip(getSkip(page, limit))
      .limit(limit),
    Reply.countDocuments(filter),
  ]);

  const populatedReplies = replies
    .filter((reply) => reply.author && typeof reply.author !== 'string')
    .map((reply) => reply as unknown as PopulatedReply);

  const safeReplies = await toSafeRepliesWithLikeState(populatedReplies, requesterId);
  return toPaginatedResult(safeReplies, total, page, limit);
};

export const getReplyById = async (replyId: string, requesterId: string): Promise<SafeReply> => {
  const reply = await Reply.findById(replyId).populate<{ author: IUser }>('author', AUTHOR_SELECT);
  if (!reply || !reply.author || typeof reply.author === 'string') {
    throw new ApiError(404, 'Reply not found!');
  }

  await assertCommentAccessible(reply.comment.toString(), requesterId);

  const likedReplyIds = await getLikedReplyIds(requesterId, [replyId]);
  return toSafeReply(reply as unknown as PopulatedReply, likedReplyIds.has(replyId));
};

export const updateReply = async (
  replyId: string,
  authorId: string,
  payload: z.infer<typeof updateReplySchema>,
): Promise<SafeReply> => {
  const reply = await Reply.findOneAndUpdate(
    { _id: replyId, author: authorId },
    { text: payload.text },
    { new: true, runValidators: true },
  ).populate<{ author: IUser }>('author', AUTHOR_SELECT);

  if (!reply || !reply.author || typeof reply.author === 'string') {
    throw new ApiError(404, 'Reply not found!');
  }

  const likedReplyIds = await getLikedReplyIds(authorId, [replyId]);
  return toSafeReply(reply as unknown as PopulatedReply, likedReplyIds.has(replyId));
};

export const deleteReply = async (replyId: string, authorId: string): Promise<void> => {
  const reply = await Reply.findOne({ _id: replyId, author: authorId });
  if (!reply) {
    throw new ApiError(404, 'Reply not found!');
  }

  await deleteReplyById(replyId, reply.comment.toString());
};

const deleteReplyById = async (replyId: string, commentId: string): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await Like.deleteMany({ targetType: 'REPLY', targetId: replyId }).session(session);
    await Reply.findByIdAndDelete(replyId).session(session);
    await Comment.findOneAndUpdate(
      { _id: commentId, repliesCount: { $gt: 0 } },
      { $inc: { repliesCount: -1 } },
    ).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
