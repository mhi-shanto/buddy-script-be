import { Request, Response } from 'express';
import * as postService from '../services/post.service';
import { cursorPaginationSchema } from '../validation/pagination.validation';
import {
  authorIdParamsSchema,
  createPostSchema,
  postIdParamsSchema,
  updatePostSchema,
} from '../validation/post.validation';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const payload = createPostSchema.parse(req.body);
    const post = await postService.createPost(userId, payload);
    sendSuccess(res, 201, 'Post created successfully', post);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { postId } = postIdParamsSchema.parse(req.params);
    const post = await postService.getPostById(postId, userId);
    sendSuccess(res, 200, 'Post fetched successfully', post);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getPublicPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const pagination = cursorPaginationSchema.parse(req.query);
    const result = await postService.getPublicPosts(userId, pagination);
    sendSuccess(res, 200, 'Posts fetched successfully', result);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getPostsByAuthor = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { authorId } = authorIdParamsSchema.parse(req.params);
    const pagination = cursorPaginationSchema.parse(req.query);
    const result = await postService.getPostsByAuthor(authorId, userId, pagination);
    sendSuccess(res, 200, 'Posts fetched successfully', result);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { postId } = postIdParamsSchema.parse(req.params);
    const payload = updatePostSchema.parse(req.body);
    const post = await postService.updatePost(postId, userId, payload);
    sendSuccess(res, 200, 'Post updated successfully', post);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { postId } = postIdParamsSchema.parse(req.params);
    await postService.deletePost(postId, userId);
    sendSuccess(res, 200, 'Post deleted successfully');
  } catch (error) {
    sendError(res, error as ApiError);
  }
};
