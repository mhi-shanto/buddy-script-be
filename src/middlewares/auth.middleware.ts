import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.util';
import { sendError } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, new ApiError(401, 'Authentication token is missing'));
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    sendError(res, new ApiError(401, 'Invalid or expired authentication token'));
  }
};
