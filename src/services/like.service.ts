import z from 'zod';
import { Comment } from '../models/comment.model';
import { Like, LikeTargetType } from '../models/like.model';
import { Post } from '../models/post.model';
import { Reply } from '../models/reply.model';
import { IUser } from '../models/user.model';
import { PaginatedResult } from '../types/pagination.type';
import { likeTargetSchema } from '../validation/like.validation';
import { paginationSchema } from '../validation/pagination.validation';
import { ApiError } from '../utils/apiError';
import { getSkip, toPaginatedResult } from '../utils/pagination.util';
import { SafeUser } from './user.service';

export interface LikeState {
  hasLiked: boolean;
  likesCount: number;
}

const toSafeUser = (user: IUser): SafeUser => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const assertPostAccessible = async (postId: string, userId: string): Promise<void> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found!');
  }
  if (post.visibility === 'PRIVATE' && post.author.toString() !== userId) {
    throw new ApiError(403, 'You do not have access to this post!');
  }
};

const verifyTargetAccess = async (
  targetType: LikeTargetType,
  targetId: string,
  userId: string,
): Promise<void> => {
  if (targetType === 'POST') {
    await assertPostAccessible(targetId, userId);
    return;
  }

  if (targetType === 'COMMENT') {
    const comment = await Comment.findById(targetId);
    if (!comment) {
      throw new ApiError(404, 'Comment not found!');
    }
    await assertPostAccessible(comment.post.toString(), userId);
    return;
  }

  if (targetType === 'REPLY') {
    const reply = await Reply.findById(targetId);
    if (!reply) {
      throw new ApiError(404, 'Reply not found!');
    }
    const comment = await Comment.findById(reply.comment);
    if (!comment) {
      throw new ApiError(404, 'Comment not found!');
    }
    await assertPostAccessible(comment.post.toString(), userId);
    return;
  }

  throw new ApiError(404, 'Target not found!');
};

const getTargetLikesCount = async (
  targetType: LikeTargetType,
  targetId: string,
): Promise<number> => {
  if (targetType === 'POST') {
    const post = await Post.findById(targetId).select('likesCount');
    if (!post) {
      throw new ApiError(404, 'Post not found!');
    }
    return post.likesCount;
  }

  if (targetType === 'COMMENT') {
    const comment = await Comment.findById(targetId).select('likesCount');
    if (!comment) {
      throw new ApiError(404, 'Comment not found!');
    }
    return comment.likesCount;
  }

  if (targetType === 'REPLY') {
    const reply = await Reply.findById(targetId).select('likesCount');
    if (!reply) {
      throw new ApiError(404, 'Reply not found!');
    }
    return reply.likesCount;
  }

  return Like.countDocuments({ targetType, targetId });
};

const incrementTargetLikeCount = async (
  targetType: LikeTargetType,
  targetId: string,
  value: 1 | -1,
): Promise<number> => {
  if (targetType === 'POST') {
    const filter = value === -1 ? { _id: targetId, likesCount: { $gt: 0 } } : { _id: targetId };
    const post = await Post.findOneAndUpdate(
      filter,
      { $inc: { likesCount: value } },
      { new: true },
    );
    if (!post) {
      throw new ApiError(404, 'Post not found!');
    }
    return post.likesCount;
  }

  if (targetType === 'COMMENT') {
    const filter = value === -1 ? { _id: targetId, likesCount: { $gt: 0 } } : { _id: targetId };
    const comment = await Comment.findOneAndUpdate(
      filter,
      { $inc: { likesCount: value } },
      { new: true },
    );
    if (!comment) {
      throw new ApiError(404, 'Comment not found!');
    }
    return comment.likesCount;
  }

  if (targetType === 'REPLY') {
    const filter = value === -1 ? { _id: targetId, likesCount: { $gt: 0 } } : { _id: targetId };
    const reply = await Reply.findOneAndUpdate(
      filter,
      { $inc: { likesCount: value } },
      { new: true },
    );
    if (!reply) {
      throw new ApiError(404, 'Reply not found!');
    }
    return reply.likesCount;
  }

  return Like.countDocuments({ targetType, targetId });
};

export const getLikedPostIds = async (userId: string, postIds: string[]): Promise<Set<string>> => {
  if (postIds.length === 0) {
    return new Set();
  }

  const likes = await Like.find({
    user: userId,
    targetType: 'POST',
    targetId: { $in: postIds },
  }).select('targetId');

  return new Set(likes.map((like) => like.targetId.toString()));
};

export const getLikedCommentIds = async (
  userId: string,
  commentIds: string[],
): Promise<Set<string>> => {
  if (commentIds.length === 0) {
    return new Set();
  }

  const likes = await Like.find({
    user: userId,
    targetType: 'COMMENT',
    targetId: { $in: commentIds },
  }).select('targetId');

  return new Set(likes.map((like) => like.targetId.toString()));
};

export const getLikedReplyIds = async (
  userId: string,
  replyIds: string[],
): Promise<Set<string>> => {
  if (replyIds.length === 0) {
    return new Set();
  }

  const likes = await Like.find({
    user: userId,
    targetType: 'REPLY',
    targetId: { $in: replyIds },
  }).select('targetId');

  return new Set(likes.map((like) => like.targetId.toString()));
};

export const likeTarget = async (
  userId: string,
  payload: z.infer<typeof likeTargetSchema>,
): Promise<LikeState> => {
  const { targetType, targetId } = payload;
  await verifyTargetAccess(targetType, targetId, userId);

  const existingLike = await Like.findOne({ user: userId, targetType, targetId });
  if (existingLike) {
    throw new ApiError(409, 'Already liked!');
  }

  try {
    await Like.create({ user: userId, targetType, targetId });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      throw new ApiError(409, 'Already liked!');
    }
    throw error;
  }

  const likesCount = await incrementTargetLikeCount(targetType, targetId, 1);
  return { hasLiked: true, likesCount };
};

export const unlikeTarget = async (
  userId: string,
  payload: z.infer<typeof likeTargetSchema>,
): Promise<LikeState> => {
  const { targetType, targetId } = payload;
  await verifyTargetAccess(targetType, targetId, userId);

  const like = await Like.findOneAndDelete({ user: userId, targetType, targetId });
  if (!like) {
    throw new ApiError(404, 'Like not found!');
  }

  const likesCount = await incrementTargetLikeCount(targetType, targetId, -1);
  return { hasLiked: false, likesCount };
};

export const getLikeStatus = async (
  userId: string,
  payload: z.infer<typeof likeTargetSchema>,
): Promise<LikeState> => {
  const { targetType, targetId } = payload;
  await verifyTargetAccess(targetType, targetId, userId);

  const [hasLiked, likesCount] = await Promise.all([
    Like.exists({ user: userId, targetType, targetId }),
    getTargetLikesCount(targetType, targetId),
  ]);

  return { hasLiked: Boolean(hasLiked), likesCount };
};

export const getTargetLikes = async (
  userId: string,
  payload: z.infer<typeof likeTargetSchema>,
  pagination: z.infer<typeof paginationSchema>,
): Promise<PaginatedResult<SafeUser>> => {
  const { targetType, targetId } = payload;
  await verifyTargetAccess(targetType, targetId, userId);

  const filter = { targetType, targetId };
  const { page, limit } = pagination;

  const [likes, total] = await Promise.all([
    Like.find(filter)
      .populate<{ user: IUser }>('user', 'firstName lastName email avatar createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(limit),
    Like.countDocuments(filter),
  ]);

  const users = likes.filter((like) => like.user).map((like) => toSafeUser(like.user as IUser));

  return toPaginatedResult(users, total, page, limit);
};
