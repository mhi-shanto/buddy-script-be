"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const apiError_1 = require("./apiError");
const sendSuccess = (res, statusCode, message, data) => {
    res.status(statusCode).json({
        success: true,
        message,
        ...(data !== undefined ? { data } : {}),
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, error) => {
    if (error instanceof apiError_1.ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
    }
    if (error instanceof zod_1.ZodError) {
        const message = error.issues.map((issue) => issue.message).join(', ');
        res.status(400).json({ success: false, message });
        return;
    }
    if (error instanceof mongoose_1.default.Error.ValidationError) {
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
exports.sendError = sendError;
//# sourceMappingURL=apiResponse.js.map