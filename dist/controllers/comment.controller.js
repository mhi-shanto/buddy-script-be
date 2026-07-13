"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getCommentById = exports.getCommentsByPost = exports.createComment = void 0;
const commentService = __importStar(require("../services/comment.service"));
const comment_validation_1 = require("../validation/comment.validation");
const pagination_validation_1 = require("../validation/pagination.validation");
const apiResponse_1 = require("../utils/apiResponse");
const createComment = async (req, res) => {
    try {
        const userId = req.userId;
        const { postId } = comment_validation_1.postIdParamsSchema.parse(req.params);
        const payload = comment_validation_1.createCommentSchema.parse(req.body);
        const comment = await commentService.createComment(postId, userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 201, 'Comment created successfully', comment);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.createComment = createComment;
const getCommentsByPost = async (req, res) => {
    try {
        const userId = req.userId;
        const { postId } = comment_validation_1.postIdParamsSchema.parse(req.params);
        const pagination = pagination_validation_1.paginationSchema.parse(req.query);
        const result = await commentService.getCommentsByPost(postId, userId, pagination);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Comments fetched successfully', result);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getCommentsByPost = getCommentsByPost;
const getCommentById = async (req, res) => {
    try {
        const userId = req.userId;
        const { commentId } = comment_validation_1.commentIdParamsSchema.parse(req.params);
        const comment = await commentService.getCommentById(commentId, userId);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Comment fetched successfully', comment);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getCommentById = getCommentById;
const updateComment = async (req, res) => {
    try {
        const userId = req.userId;
        const { commentId } = comment_validation_1.commentIdParamsSchema.parse(req.params);
        const payload = comment_validation_1.updateCommentSchema.parse(req.body);
        const comment = await commentService.updateComment(commentId, userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Comment updated successfully', comment);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res) => {
    try {
        const userId = req.userId;
        const { commentId } = comment_validation_1.commentIdParamsSchema.parse(req.params);
        await commentService.deleteComment(commentId, userId);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Comment deleted successfully');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.deleteComment = deleteComment;
//# sourceMappingURL=comment.controller.js.map