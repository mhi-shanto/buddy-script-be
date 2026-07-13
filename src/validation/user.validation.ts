import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z
  .string()
  .min(1, 'ID is required')
  .refine((value) => Types.ObjectId.isValid(value), 'Invalid ID');

export const userIdParamsSchema = z.object({
  userId: objectIdSchema,
});

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  incomingRefreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().optional(),
});
