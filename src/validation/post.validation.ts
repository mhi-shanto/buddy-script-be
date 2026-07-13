import { z } from 'zod';
import { Types } from 'mongoose';
import { POST_VISIBILITY } from '../models/post.model';

const objectIdSchema = z
  .string()
  .min(1, 'ID is required')
  .refine((value) => Types.ObjectId.isValid(value), 'Invalid ID');

export const postIdParamsSchema = z.object({
  postId: objectIdSchema,
});

export const authorIdParamsSchema = z.object({
  authorId: objectIdSchema,
});

const hasTextOrImage = (data: { text?: string; image?: string }): boolean => {
  const hasText = Boolean(data.text?.trim());
  const hasImage = Boolean(data.image?.trim());
  return hasText || hasImage;
};

export const createPostSchema = z
  .object({
    text: z.string().max(5000, 'Text cannot exceed 5000 characters').trim().optional(),
    image: z.string().max(2048, 'Image URL cannot exceed 2048 characters').trim().optional(),
    visibility: z.enum(POST_VISIBILITY).optional(),
  })
  .refine(hasTextOrImage, { message: 'Post must have text or image' });

export const updatePostSchema = z.object({
  text: z.string().max(5000, 'Text cannot exceed 5000 characters').trim().optional(),
  image: z.string().max(2048, 'Image URL cannot exceed 2048 characters').trim().optional(),
  visibility: z.enum(POST_VISIBILITY).optional(),
});
