import { z } from 'zod';
import { Types } from 'mongoose';
import { LIKE_TARGET_TYPES } from '../models/like.model';

const objectIdSchema = z
  .string()
  .min(1, 'Target ID is required')
  .refine((value) => Types.ObjectId.isValid(value), 'Invalid target ID');

export const likeTargetSchema = z.object({
  targetType: z.enum(LIKE_TARGET_TYPES),
  targetId: objectIdSchema,
});

export const likeTargetParamsSchema = z.object({
  targetType: z.enum(LIKE_TARGET_TYPES),
  targetId: objectIdSchema,
});
