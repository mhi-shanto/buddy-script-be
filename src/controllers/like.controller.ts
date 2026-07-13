import { Request, Response } from 'express';
import * as likeService from '../services/like.service';
import { likeTargetParamsSchema, likeTargetSchema } from '../validation/like.validation';
import { paginationSchema } from '../validation/pagination.validation';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export const likeTarget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const payload = likeTargetSchema.parse(req.body);
    const result = await likeService.likeTarget(userId, payload);
    sendSuccess(res, 201, 'Liked successfully', result);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const unlikeTarget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const payload = likeTargetParamsSchema.parse(req.params);
    const result = await likeService.unlikeTarget(userId, payload);
    sendSuccess(res, 200, 'Unliked successfully', result);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getLikeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const payload = likeTargetParamsSchema.parse(req.params);
    const result = await likeService.getLikeStatus(userId, payload);
    sendSuccess(res, 200, 'Like status fetched successfully', result);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getTargetLikes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const payload = likeTargetParamsSchema.parse(req.params);
    const pagination = paginationSchema.parse(req.query);
    const result = await likeService.getTargetLikes(userId, payload, pagination);
    sendSuccess(res, 200, 'Likes fetched successfully', result);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};
