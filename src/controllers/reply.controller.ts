import { Request, Response } from 'express';
import * as replyService from '../services/reply.service';
import {
  commentIdParamsSchema,
  createReplySchema,
  replyIdParamsSchema,
  updateReplySchema,
} from '../validation/reply.validation';
import { paginationSchema } from '../validation/pagination.validation';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export const createReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { commentId } = commentIdParamsSchema.parse(req.params);
    const payload = createReplySchema.parse(req.body);
    const reply = await replyService.createReply(commentId, userId, payload);
    sendSuccess(res, 201, 'Reply created successfully', reply);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getRepliesByComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { commentId } = commentIdParamsSchema.parse(req.params);
    const pagination = paginationSchema.parse(req.query);
    const result = await replyService.getRepliesByComment(commentId, userId, pagination);
    sendSuccess(res, 200, 'Replies fetched successfully', result);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getReplyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { replyId } = replyIdParamsSchema.parse(req.params);
    const reply = await replyService.getReplyById(replyId, userId);
    sendSuccess(res, 200, 'Reply fetched successfully', reply);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const updateReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { replyId } = replyIdParamsSchema.parse(req.params);
    const payload = updateReplySchema.parse(req.body);
    const reply = await replyService.updateReply(replyId, userId, payload);
    sendSuccess(res, 200, 'Reply updated successfully', reply);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const deleteReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { replyId } = replyIdParamsSchema.parse(req.params);
    await replyService.deleteReply(replyId, userId);
    sendSuccess(res, 200, 'Reply deleted successfully');
  } catch (error) {
    sendError(res, error as ApiError);
  }
};
