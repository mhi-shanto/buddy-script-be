import z from 'zod';
import mongoose from 'mongoose';
import { IPost, Post, PostVisibility } from '../models/post.model';
import { IUser } from '../models/user.model';
import { CursorPage } from '../types/pagination.type';
import { createPostSchema, updatePostSchema } from '../validation/post.validation';
import { cursorPaginationSchema } from '../validation/pagination.validation';
import { ApiError } from '../utils/apiError';
import { buildKeysetFilter, encodeCursor } from '../utils/pagination.util';
import { getLikedPostIds } from './like.service';
import { Comment } from '../models/comment.model';
import { Reply } from '../models/reply.model';
import { Like } from '../models/like.model';
import { SafeUser } from './user.service';

export interface SafePost {
  id: string;
  author: SafeUser;
  text?: string;
  image?: string;
  visibility: PostVisibility;
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type PopulatedPost = Omit<IPost, 'author'> & { author: IUser };

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

const toSafePost = (post: PopulatedPost, hasLiked: boolean): SafePost => ({
  id: post._id.toString(),
  author: toSafeUser(post.author),
  text: post.text,
  image: post.image,
  visibility: post.visibility,
  likesCount: post.likesCount,
  commentsCount: post.commentsCount,
  hasLiked,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

const toPopulatedPosts = (posts: unknown[]): PopulatedPost[] =>
  posts
    .filter((post) => {
      const author = (post as IPost).author;
      return author && typeof author !== 'string';
    })
    .map((post) => post as unknown as PopulatedPost);

const populatePostAuthor = async (postId: string): Promise<PopulatedPost> => {
  const populatedPost = await Post.findById(postId).populate<{ author: IUser }>(
    'author',
    AUTHOR_SELECT,
  );

  if (!populatedPost || !populatedPost.author || typeof populatedPost.author === 'string') {
    throw new ApiError(404, 'Post author not found!');
  }

  return populatedPost as unknown as PopulatedPost;
};

const toSafePostsWithLikeState = async (
  posts: PopulatedPost[],
  requesterId: string,
): Promise<SafePost[]> => {
  const postIds = posts.map((post) => post._id.toString());
  const likedPostIds = await getLikedPostIds(requesterId, postIds);
  return posts.map((post) => toSafePost(post, likedPostIds.has(post._id.toString())));
};

export const createPost = async (
  authorId: string,
  payload: z.infer<typeof createPostSchema>,
): Promise<SafePost> => {
  const { text, image, visibility } = payload;
  const post = await Post.create({
    author: authorId,
    text,
    image,
    visibility,
  });

  const populatedPost = await populatePostAuthor(post._id.toString());
  return toSafePost(populatedPost, false);
};

export const getPostById = async (postId: string, requesterId: string): Promise<SafePost> => {
  const post = await Post.findById(postId).populate<{ author: IUser }>('author', AUTHOR_SELECT);

  if (!post) {
    throw new ApiError(404, 'Post not found!');
  }

  if (
    post.visibility === 'PRIVATE' &&
    post.author &&
    typeof post.author !== 'string' &&
    post.author._id.toString() !== requesterId
  ) {
    throw new ApiError(403, 'You do not have access to this post!');
  }

  if (!post.author || typeof post.author === 'string') {
    throw new ApiError(404, 'Post author not found!');
  }

  const likedPostIds = await getLikedPostIds(requesterId, [postId]);
  return toSafePost(post as unknown as PopulatedPost, likedPostIds.has(postId));
};

const paginatePostsByFilter = async (
  filter: Record<string, unknown>,
  requesterId: string,
  { cursor, limit }: z.infer<typeof cursorPaginationSchema>,
): Promise<CursorPage<SafePost>> => {
  const query = { ...filter, ...buildKeysetFilter(cursor) };

  const docs = await Post.find(query)
    .populate<{ author: IUser }>('author', AUTHOR_SELECT)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasNextPage = docs.length > limit;
  const pageDocs = hasNextPage ? docs.slice(0, limit) : docs;
  const lastDoc = pageDocs[pageDocs.length - 1];

  const data = await toSafePostsWithLikeState(toPopulatedPosts(pageDocs), requesterId);

  return {
    data,
    nextCursor:
      hasNextPage && lastDoc
        ? encodeCursor({ createdAt: lastDoc.createdAt, _id: lastDoc._id.toString() })
        : null,
    hasNextPage,
  };
};

export const getPostsByAuthor = async (
  authorId: string,
  requesterId: string,
  pagination: z.infer<typeof cursorPaginationSchema>,
): Promise<CursorPage<SafePost>> => {
  const isOwner = authorId === requesterId;
  const filter = isOwner
    ? { author: authorId }
    : { author: authorId, visibility: 'PUBLIC' as const };

  return paginatePostsByFilter(filter, requesterId, pagination);
};

export const getPublicPosts = async (
  requesterId: string,
  pagination: z.infer<typeof cursorPaginationSchema>,
): Promise<CursorPage<SafePost>> => {
  return paginatePostsByFilter({ visibility: 'PUBLIC' as const }, requesterId, pagination);
};

export const updatePost = async (
  postId: string,
  authorId: string,
  payload: z.infer<typeof updatePostSchema>,
): Promise<SafePost> => {
  const post = await Post.findOne({ _id: postId, author: authorId });
  if (!post) {
    throw new ApiError(404, 'Post not found!');
  }

  const updatedPost = await Post.findByIdAndUpdate(postId, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedPost) {
    throw new ApiError(404, 'Post not found!');
  }

  const populatedPost = await populatePostAuthor(postId);
  const likedPostIds = await getLikedPostIds(authorId, [postId]);
  return toSafePost(populatedPost, likedPostIds.has(postId));
};

export const deletePost = async (postId: string, authorId: string): Promise<void> => {
  const post = await Post.findOne({ _id: postId, author: authorId });
  if (!post) {
    throw new ApiError(404, 'Post not found!');
  }
  await deletePostById(postId);
};

const deletePostById = async (postId: string): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const comments = await Comment.find({ post: postId }).select('_id').session(session);
    const commentIds = comments.map((comment) => comment._id);

    const replies = await Reply.find({ comment: { $in: commentIds } })
      .select('_id')
      .session(session);
    const replyIds = replies.map((reply) => reply._id);

    await Like.deleteMany({
      $or: [
        { targetType: 'POST', targetId: postId },
        { targetType: 'COMMENT', targetId: { $in: commentIds } },
        { targetType: 'REPLY', targetId: { $in: replyIds } },
      ],
    }).session(session);

    await Reply.deleteMany({ comment: { $in: commentIds } }).session(session);
    await Comment.deleteMany({ post: postId }).session(session);
    await Post.findByIdAndDelete(postId).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
