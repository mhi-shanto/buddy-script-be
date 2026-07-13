"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getCommentById = exports.getCommentsByPost = exports.createComment = void 0;
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
const toSafeComment = (comment, hasLiked) => ({
    id: comment._id.toString(),
    post: comment.post.toString(),
    author: toSafeUser(comment.author),
    text: comment.text,
    likesCount: comment.likesCount,
    repliesCount: comment.repliesCount,
    hasLiked,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
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
const toSafeCommentsWithLikeState = async (comments, requesterId) => {
    const commentIds = comments.map((comment) => comment._id.toString());
    const likedCommentIds = await (0, like_service_1.getLikedCommentIds)(requesterId, commentIds);
    return comments.map((comment) => toSafeComment(comment, likedCommentIds.has(comment._id.toString())));
};
const createComment = async (postId, authorId, payload) => {
    await assertPostAccessible(postId, authorId);
    const comment = await comment_model_1.Comment.create({
        post: postId,
        author: authorId,
        text: payload.text,
    });
    await post_model_1.Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    const populatedComment = await comment_model_1.Comment.findById(comment._id).populate('author', AUTHOR_SELECT);
    if (!populatedComment ||
        !populatedComment.author ||
        typeof populatedComment.author === 'string') {
        throw new apiError_1.ApiError(404, 'Comment not found!');
    }
    return toSafeComment(populatedComment, false);
};
exports.createComment = createComment;
const getCommentsByPost = async (postId, requesterId, pagination) => {
    await assertPostAccessible(postId, requesterId);
    const { page, limit } = pagination;
    const filter = { post: postId };
    const [comments, total] = await Promise.all([
        comment_model_1.Comment.find(filter)
            .populate('author', AUTHOR_SELECT)
            .sort({ createdAt: -1 })
            .skip((0, pagination_util_1.getSkip)(page, limit))
            .limit(limit),
        comment_model_1.Comment.countDocuments(filter),
    ]);
    const populatedComments = comments
        .filter((comment) => comment.author && typeof comment.author !== 'string')
        .map((comment) => comment);
    const safeComments = await toSafeCommentsWithLikeState(populatedComments, requesterId);
    return (0, pagination_util_1.toPaginatedResult)(safeComments, total, page, limit);
};
exports.getCommentsByPost = getCommentsByPost;
const getCommentById = async (commentId, requesterId) => {
    const comment = await comment_model_1.Comment.findById(commentId).populate('author', AUTHOR_SELECT);
    if (!comment || !comment.author || typeof comment.author === 'string') {
        throw new apiError_1.ApiError(404, 'Comment not found!');
    }
    await assertPostAccessible(comment.post.toString(), requesterId);
    const likedCommentIds = await (0, like_service_1.getLikedCommentIds)(requesterId, [commentId]);
    return toSafeComment(comment, likedCommentIds.has(commentId));
};
exports.getCommentById = getCommentById;
const updateComment = async (commentId, authorId, payload) => {
    const comment = await comment_model_1.Comment.findOneAndUpdate({ _id: commentId, author: authorId }, { text: payload.text }, { new: true, runValidators: true }).populate('author', AUTHOR_SELECT);
    if (!comment || !comment.author || typeof comment.author === 'string') {
        throw new apiError_1.ApiError(404, 'Comment not found!');
    }
    const likedCommentIds = await (0, like_service_1.getLikedCommentIds)(authorId, [commentId]);
    return toSafeComment(comment, likedCommentIds.has(commentId));
};
exports.updateComment = updateComment;
const deleteComment = async (commentId, authorId) => {
    const comment = await comment_model_1.Comment.findOne({ _id: commentId, author: authorId });
    if (!comment) {
        throw new apiError_1.ApiError(404, 'Comment not found!');
    }
    await deleteCommentById(commentId, comment.post.toString());
};
exports.deleteComment = deleteComment;
const deleteCommentById = async (commentId, postId) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const replies = await reply_model_1.Reply.find({ comment: commentId }).select('_id').session(session);
        const replyIds = replies.map((reply) => reply._id);
        await like_model_1.Like.deleteMany({
            $or: [
                { targetType: 'COMMENT', targetId: commentId },
                { targetType: 'REPLY', targetId: { $in: replyIds } },
            ],
        }).session(session);
        await reply_model_1.Reply.deleteMany({ comment: commentId }).session(session);
        await comment_model_1.Comment.findByIdAndDelete(commentId).session(session);
        await post_model_1.Post.findOneAndUpdate({ _id: postId, commentsCount: { $gt: 0 } }, { $inc: { commentsCount: -1 } }).session(session);
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
//# sourceMappingURL=comment.service.js.map