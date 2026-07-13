import z from 'zod';
import mongoose from 'mongoose';
import { Comment, IComment } from '../models/comment.model';
import { Like } from '../models/like.model';
import { Post } from '../models/post.model';
import { Reply } from '../models/reply.model';
import { IUser } from '../models/user.model';
import { PaginatedResult } from '../types/pagination.type';
import { createCommentSchema, updateCommentSchema } from '../validation/comment.validation';
import { paginationSchema } from '../validation/pagination.validation';
import { ApiError } from '../utils/apiError';
import { getSkip, toPaginatedResult } from '../utils/pagination.util';
import { getLikedCommentIds } from './like.service';
import { SafeUser } from './user.service';

export interface SafeComment {
  id: string;
  post: string;
  author: SafeUser;
  text: string;
  likesCount: number;
  repliesCount: number;
  hasLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type PopulatedComment = Omit<IComment, 'author'> & { author: IUser };

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

const toSafeComment = (comment: PopulatedComment, hasLiked: boolean): SafeComment => ({
  id: comment._id.toString(),
  post: comment.post.toString(),
  author: toSafeUser(comment.author),
  text: comment.text,
  likesCount: comment.likesCount,
  repliesCount: comment.repliesCount,
  hasLiked,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
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

const toSafeCommentsWithLikeState = async (
  comments: PopulatedComment[],
  requesterId: string,
): Promise<SafeComment[]> => {
  const commentIds = comments.map((comment) => comment._id.toString());
  const likedCommentIds = await getLikedCommentIds(requesterId, commentIds);
  return comments.map((comment) =>
    toSafeComment(comment, likedCommentIds.has(comment._id.toString())),
  );
};

export const createComment = async (
  postId: string,
  authorId: string,
  payload: z.infer<typeof createCommentSchema>,
): Promise<SafeComment> => {
  await assertPostAccessible(postId, authorId);

  const comment = await Comment.create({
    post: postId,
    author: authorId,
    text: payload.text,
  });

  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  const populatedComment = await Comment.findById(comment._id).populate<{ author: IUser }>(
    'author',
    AUTHOR_SELECT,
  );
  if (
    !populatedComment ||
    !populatedComment.author ||
    typeof populatedComment.author === 'string'
  ) {
    throw new ApiError(404, 'Comment not found!');
  }

  return toSafeComment(populatedComment as unknown as PopulatedComment, false);
};

export const getCommentsByPost = async (
  postId: string,
  requesterId: string,
  pagination: z.infer<typeof paginationSchema>,
): Promise<PaginatedResult<SafeComment>> => {
  await assertPostAccessible(postId, requesterId);

  const { page, limit } = pagination;
  const filter = { post: postId };

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate<{ author: IUser }>('author', AUTHOR_SELECT)
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  const populatedComments = comments
    .filter((comment) => comment.author && typeof comment.author !== 'string')
    .map((comment) => comment as unknown as PopulatedComment);

  const safeComments = await toSafeCommentsWithLikeState(populatedComments, requesterId);
  return toPaginatedResult(safeComments, total, page, limit);
};

export const getCommentById = async (
  commentId: string,
  requesterId: string,
): Promise<SafeComment> => {
  const comment = await Comment.findById(commentId).populate<{ author: IUser }>(
    'author',
    AUTHOR_SELECT,
  );
  if (!comment || !comment.author || typeof comment.author === 'string') {
    throw new ApiError(404, 'Comment not found!');
  }

  await assertPostAccessible(comment.post.toString(), requesterId);

  const likedCommentIds = await getLikedCommentIds(requesterId, [commentId]);
  return toSafeComment(comment as unknown as PopulatedComment, likedCommentIds.has(commentId));
};

export const updateComment = async (
  commentId: string,
  authorId: string,
  payload: z.infer<typeof updateCommentSchema>,
): Promise<SafeComment> => {
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, author: authorId },
    { text: payload.text },
    { new: true, runValidators: true },
  ).populate<{ author: IUser }>('author', AUTHOR_SELECT);

  if (!comment || !comment.author || typeof comment.author === 'string') {
    throw new ApiError(404, 'Comment not found!');
  }

  const likedCommentIds = await getLikedCommentIds(authorId, [commentId]);
  return toSafeComment(comment as unknown as PopulatedComment, likedCommentIds.has(commentId));
};

export const deleteComment = async (commentId: string, authorId: string): Promise<void> => {
  const comment = await Comment.findOne({ _id: commentId, author: authorId });
  if (!comment) {
    throw new ApiError(404, 'Comment not found!');
  }

  await deleteCommentById(commentId, comment.post.toString());
};

const deleteCommentById = async (commentId: string, postId: string): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const replies = await Reply.find({ comment: commentId }).select('_id').session(session);
    const replyIds = replies.map((reply) => reply._id);

    await Like.deleteMany({
      $or: [
        { targetType: 'COMMENT', targetId: commentId },
        { targetType: 'REPLY', targetId: { $in: replyIds } },
      ],
    }).session(session);

    await Reply.deleteMany({ comment: commentId }).session(session);
    await Comment.findByIdAndDelete(commentId).session(session);
    await Post.findOneAndUpdate(
      { _id: postId, commentsCount: { $gt: 0 } },
      { $inc: { commentsCount: -1 } },
    ).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
