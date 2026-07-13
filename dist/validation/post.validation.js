"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = exports.authorIdParamsSchema = exports.postIdParamsSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const post_model_1 = require("../models/post.model");
const objectIdSchema = zod_1.z
    .string()
    .min(1, 'ID is required')
    .refine((value) => mongoose_1.Types.ObjectId.isValid(value), 'Invalid ID');
exports.postIdParamsSchema = zod_1.z.object({
    postId: objectIdSchema,
});
exports.authorIdParamsSchema = zod_1.z.object({
    authorId: objectIdSchema,
});
const hasTextOrImage = (data) => {
    const hasText = Boolean(data.text?.trim());
    const hasImage = Boolean(data.image?.trim());
    return hasText || hasImage;
};
exports.createPostSchema = zod_1.z
    .object({
    text: zod_1.z.string().max(5000, 'Text cannot exceed 5000 characters').trim().optional(),
    image: zod_1.z.string().max(2048, 'Image URL cannot exceed 2048 characters').trim().optional(),
    visibility: zod_1.z.enum(post_model_1.POST_VISIBILITY).optional(),
})
    .refine(hasTextOrImage, { message: 'Post must have text or image' });
exports.updatePostSchema = zod_1.z.object({
    text: zod_1.z.string().max(5000, 'Text cannot exceed 5000 characters').trim().optional(),
    image: zod_1.z.string().max(2048, 'Image URL cannot exceed 2048 characters').trim().optional(),
    visibility: zod_1.z.enum(post_model_1.POST_VISIBILITY).optional(),
});
//# sourceMappingURL=post.validation.js.map