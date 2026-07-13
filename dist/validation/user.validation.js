"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.refreshTokenSchema = exports.loginSchema = exports.signupSchema = exports.userIdParamsSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const objectIdSchema = zod_1.z
    .string()
    .min(1, 'ID is required')
    .refine((value) => mongoose_1.Types.ObjectId.isValid(value), 'Invalid ID');
exports.userIdParamsSchema = zod_1.z.object({
    userId: objectIdSchema,
});
exports.signupSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.refreshTokenSchema = zod_1.z.object({
    incomingRefreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    avatar: zod_1.z.string().optional(),
});
//# sourceMappingURL=user.validation.js.map