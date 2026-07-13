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
exports.deleteReply = exports.updateReply = exports.getReplyById = exports.getRepliesByComment = exports.createReply = void 0;
const replyService = __importStar(require("../services/reply.service"));
const reply_validation_1 = require("../validation/reply.validation");
const pagination_validation_1 = require("../validation/pagination.validation");
const apiResponse_1 = require("../utils/apiResponse");
const createReply = async (req, res) => {
    try {
        const userId = req.userId;
        const { commentId } = reply_validation_1.commentIdParamsSchema.parse(req.params);
        const payload = reply_validation_1.createReplySchema.parse(req.body);
        const reply = await replyService.createReply(commentId, userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 201, 'Reply created successfully', reply);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.createReply = createReply;
const getRepliesByComment = async (req, res) => {
    try {
        const userId = req.userId;
        const { commentId } = reply_validation_1.commentIdParamsSchema.parse(req.params);
        const pagination = pagination_validation_1.paginationSchema.parse(req.query);
        const result = await replyService.getRepliesByComment(commentId, userId, pagination);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Replies fetched successfully', result);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getRepliesByComment = getRepliesByComment;
const getReplyById = async (req, res) => {
    try {
        const userId = req.userId;
        const { replyId } = reply_validation_1.replyIdParamsSchema.parse(req.params);
        const reply = await replyService.getReplyById(replyId, userId);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Reply fetched successfully', reply);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getReplyById = getReplyById;
const updateReply = async (req, res) => {
    try {
        const userId = req.userId;
        const { replyId } = reply_validation_1.replyIdParamsSchema.parse(req.params);
        const payload = reply_validation_1.updateReplySchema.parse(req.body);
        const reply = await replyService.updateReply(replyId, userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Reply updated successfully', reply);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.updateReply = updateReply;
const deleteReply = async (req, res) => {
    try {
        const userId = req.userId;
        const { replyId } = reply_validation_1.replyIdParamsSchema.parse(req.params);
        await replyService.deleteReply(replyId, userId);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Reply deleted successfully');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.deleteReply = deleteReply;
//# sourceMappingURL=reply.controller.js.map