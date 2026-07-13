import { Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import {
  commentIdParamsSchema,
  createCommentSchema,
  postIdParamsSchema,
  updateCommentSchema,
} from '../validation/comment.validation';
import { paginationSchema } from '../validation/pagination.validation';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { postId } = postIdParamsSchema.parse(req.params);
    const payload = createCommentSchema.parse(req.body);
    const comment = await commentService.createComment(postId, userId, payload);
    sendSuccess(res, 201, 'Comment created successfully', comment);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { postId } = postIdParamsSchema.parse(req.params);
    const pagination = paginationSchema.parse(req.query);
    const result = await commentService.getCommentsByPost(postId, userId, pagination);
    sendSuccess(res, 200, 'Comments fetched successfully', result);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getCommentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { commentId } = commentIdParamsSchema.parse(req.params);
    const comment = await commentService.getCommentById(commentId, userId);
    sendSuccess(res, 200, 'Comment fetched successfully', comment);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { commentId } = commentIdParamsSchema.parse(req.params);
    const payload = updateCommentSchema.parse(req.body);
    const comment = await commentService.updateComment(commentId, userId, payload);
    sendSuccess(res, 200, 'Comment updated successfully', comment);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { commentId } = commentIdParamsSchema.parse(req.params);
    await commentService.deleteComment(commentId, userId);
    sendSuccess(res, 200, 'Comment deleted successfully');
  } catch (error) {
    sendError(res, error as ApiError);
  }
};
