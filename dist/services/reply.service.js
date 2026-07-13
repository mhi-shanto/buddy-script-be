"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReply = exports.updateReply = exports.getReplyById = exports.getRepliesByComment = exports.createReply = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const comment_model_1 = require("../models/comment.model");
const like_model_1 = require("../models/like.model");
const post_model_1 = require("../models/post.model");
const reply_model_1 = require("../models/reply.model");
const apiError_1 = require("../utils/apiError");
const pagination_util_1 = require("../utils/pagination.util");
const like_service_1 = require("./like.service");
const AUTHOR_SELECT = 'firstName lastName email avatar createdAt updatedAt';
const toSafeUser = (user) => ({
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
const toSafeReply = (reply, hasLiked) => ({
    id: reply._id.toString(),
    comment: reply.comment.toString(),
    author: toSafeUser(reply.author),
    text: reply.text,
    likesCount: reply.likesCount,
    hasLiked,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
});
const assertPostAccessible = async (postId, requesterId) => {
    const post = await post_model_1.Post.findById(postId);
    if (!post) {
        throw new apiError_1.ApiError(404, 'Post not found!');
    }
    if (post.visibility === 'PRIVATE' && post.author.toString() !== requesterId) {
        throw new apiError_1.ApiError(403, 'You do not have access to this post!');
    }
};
const assertCommentAccessible = async (commentId, requesterId) => {
    const comment = await comment_model_1.Comment.findById(commentId);
    if (!comment) {
        throw new apiError_1.ApiError(404, 'Comment not found!');
    }
    await assertPostAccessible(comment.post.toString(), requesterId);
    return comment;
};
const toSafeRepliesWithLikeState = async (replies, requesterId) => {
    const replyIds = replies.map((reply) => reply._id.toString());
    const likedReplyIds = await (0, like_service_1.getLikedReplyIds)(requesterId, replyIds);
    return replies.map((reply) => toSafeReply(reply, likedReplyIds.has(reply._id.toString())));
};
const createReply = async (commentId, authorId, payload) => {
    await assertCommentAccessible(commentId, authorId);
    const reply = await reply_model_1.Reply.create({
        comment: commentId,
        author: authorId,
        text: payload.text,
    });
    await comment_model_1.Comment.findByIdAndUpdate(commentId, { $inc: { repliesCount: 1 } });
    const populatedReply = await reply_model_1.Reply.findById(reply._id).populate('author', AUTHOR_SELECT);
    if (!populatedReply || !populatedReply.author || typeof populatedReply.author === 'string') {
        throw new apiError_1.ApiError(404, 'Reply not found!');
    }
    return toSafeReply(populatedReply, false);
};
exports.createReply = createReply;
const getRepliesByComment = async (commentId, requesterId, pagination) => {
    await assertCommentAccessible(commentId, requesterId);
    const { page, limit } = pagination;
    const filter = { comment: commentId };
    const [replies, total] = await Promise.all([
        reply_model_1.Reply.find(filter)
            .populate('author', AUTHOR_SELECT)
            .sort({ createdAt: 1 })
            .skip((0, pagination_util_1.getSkip)(page, limit))
            .limit(limit),
        reply_model_1.Reply.countDocuments(filter),
    ]);
    const populatedReplies = replies
        .filter((reply) => reply.author && typeof reply.author !== 'string')
        .map((reply) => reply);
    const safeReplies = await toSafeRepliesWithLikeState(populatedReplies, requesterId);
    return (0, pagination_util_1.toPaginatedResult)(safeReplies, total, page, limit);
};
exports.getRepliesByComment = getRepliesByComment;
const getReplyById = async (replyId, requesterId) => {
    const reply = await reply_model_1.Reply.findById(replyId).populate('author', AUTHOR_SELECT);
    if (!reply || !reply.author || typeof reply.author === 'string') {
        throw new apiError_1.ApiError(404, 'Reply not found!');
    }
    await assertCommentAccessible(reply.comment.toString(), requesterId);
    const likedReplyIds = await (0, like_service_1.getLikedReplyIds)(requesterId, [replyId]);
    return toSafeReply(reply, likedReplyIds.has(replyId));
};
exports.getReplyById = getReplyById;
const updateReply = async (replyId, authorId, payload) => {
    const reply = await reply_model_1.Reply.findOneAndUpdate({ _id: replyId, author: authorId }, { text: payload.text }, { new: true, runValidators: true }).populate('author', AUTHOR_SELECT);
    if (!reply || !reply.author || typeof reply.author === 'string') {
        throw new apiError_1.ApiError(404, 'Reply not found!');
    }
    const likedReplyIds = await (0, like_service_1.getLikedReplyIds)(authorId, [replyId]);
    return toSafeReply(reply, likedReplyIds.has(replyId));
};
exports.updateReply = updateReply;
const deleteReply = async (replyId, authorId) => {
    const reply = await reply_model_1.Reply.findOne({ _id: replyId, author: authorId });
    if (!reply) {
        throw new apiError_1.ApiError(404, 'Reply not found!');
    }
    await deleteReplyById(replyId, reply.comment.toString());
};
exports.deleteReply = deleteReply;
const deleteReplyById = async (replyId, commentId) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        await like_model_1.Like.deleteMany({ targetType: 'REPLY', targetId: replyId }).session(session);
        await reply_model_1.Reply.findByIdAndDelete(replyId).session(session);
        await comment_model_1.Comment.findOneAndUpdate({ _id: commentId, repliesCount: { $gt: 0 } }, { $inc: { repliesCount: -1 } }).session(session);
        await session.commitTransaction();
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
//# sourceMappingURL=reply.service.js.map