"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeTargetParamsSchema = exports.likeTargetSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const like_model_1 = require("../models/like.model");
const objectIdSchema = zod_1.z
    .string()
    .min(1, 'Target ID is required')
    .refine((value) => mongoose_1.Types.ObjectId.isValid(value), 'Invalid target ID');
exports.likeTargetSchema = zod_1.z.object({
    targetType: zod_1.z.enum(like_model_1.LIKE_TARGET_TYPES),
    targetId: objectIdSchema,
});
exports.likeTargetParamsSchema = zod_1.z.object({
    targetType: zod_1.z.enum(like_model_1.LIKE_TARGET_TYPES),
    targetId: objectIdSchema,
});
//# sourceMappingURL=like.validation.js.map