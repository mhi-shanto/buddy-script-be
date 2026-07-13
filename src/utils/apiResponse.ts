import { Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from './apiError';

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  });
};

export const sendError = (res: Response, error: unknown): void => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join(', ');
    res.status(400).json({ success: false, message });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const message = Object.values(error.errors)
      .map((fieldError) => fieldError.message)
      .join(', ');
    res.status(400).json({ success: false, message });
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    res.status(409).json({ success: false, message: 'Duplicate field value' });
    return;
  }

  console.error(error);
  res.status(500).json({ success: false, message: 'Internal server error' });
};
