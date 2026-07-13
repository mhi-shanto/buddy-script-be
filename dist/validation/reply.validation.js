"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReplySchema = exports.createReplySchema = exports.replyIdParamsSchema = exports.commentIdParamsSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const objectIdSchema = zod_1.z
    .string()
    .min(1, 'ID is required')
    .refine((value) => mongoose_1.Types.ObjectId.isValid(value), 'Invalid ID');
exports.commentIdParamsSchema = zod_1.z.object({
    commentId: objectIdSchema,
});
exports.replyIdParamsSchema = zod_1.z.object({
    replyId: objectIdSchema,
});
exports.createReplySchema = zod_1.z.object({
    text: zod_1.z
        .string()
        .trim()
        .min(1, 'Text is required')
        .max(2000, 'Text cannot exceed 2000 characters'),
});
exports.updateReplySchema = zod_1.z.object({
    text: zod_1.z
        .string()
        .trim()
        .min(1, 'Text is required')
        .max(2000, 'Text cannot exceed 2000 characters'),
});
//# sourceMappingURL=reply.validation.js.map