import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z
  .string()
  .min(1, 'ID is required')
  .refine((value) => Types.ObjectId.isValid(value), 'Invalid ID');

export const postIdParamsSchema = z.object({
  postId: objectIdSchema,
});

export const commentIdParamsSchema = z.object({
  commentId: objectIdSchema,
});

export const createCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Text is required')
    .max(2000, 'Text cannot exceed 2000 characters'),
});

export const updateCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Text is required')
    .max(2000, 'Text cannot exceed 2000 characters'),
});
