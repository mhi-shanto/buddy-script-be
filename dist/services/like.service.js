"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTargetLikes = exports.getLikeStatus = exports.unlikeTarget = exports.likeTarget = exports.getLikedReplyIds = exports.getLikedCommentIds = exports.getLikedPostIds = void 0;
const comment_model_1 = require("../models/comment.model");
const like_model_1 = require("../models/like.model");
const post_model_1 = require("../models/post.model");
const reply_model_1 = require("../models/reply.model");
const apiError_1 = require("../utils/apiError");
const pagination_util_1 = require("../utils/pagination.util");
const toSafeUser = (user) => ({
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
const assertPostAccessible = async (postId, userId) => {
    const post = await post_model_1.Post.findById(postId);
    if (!post) {
        throw new apiError_1.ApiError(404, 'Post not found!');
    }
    if (post.visibility === 'PRIVATE' && post.author.toString() !== userId) {
        throw new apiError_1.ApiError(403, 'You do not have access to this post!');
    }
};
const verifyTargetAccess = async (targetType, targetId, userId) => {
    if (targetType === 'POST') {
        await assertPostAccessible(targetId, userId);
        return;
    }
    if (targetType === 'COMMENT') {
        const comment = await comment_model_1.Comment.findById(targetId);
        if (!comment) {
            throw new apiError_1.ApiError(404, 'Comment not found!');
        }
        await assertPostAccessible(comment.post.toString(), userId);
        return;
    }
    if (targetType === 'REPLY') {
        const reply = await reply_model_1.Reply.findById(targetId);
        if (!reply) {
            throw new apiError_1.ApiError(404, 'Reply not found!');
        }
        const comment = await comment_model_1.Comment.findById(reply.comment);
        if (!comment) {
            throw new apiError_1.ApiError(404, 'Comment not found!');
        }
        await assertPostAccessible(comment.post.toString(), userId);
        return;
    }
    throw new apiError_1.ApiError(404, 'Target not found!');
};
const getTargetLikesCount = async (targetType, targetId) => {
    if (targetType === 'POST') {
        const post = await post_model_1.Post.findById(targetId).select('likesCount');
        if (!post) {
            throw new apiError_1.ApiError(404, 'Post not found!');
        }
        return post.likesCount;
    }
    if (targetType === 'COMMENT') {
        const comment = await comment_model_1.Comment.findById(targetId).select('likesCount');
        if (!comment) {
            throw new apiError_1.ApiError(404, 'Comment not found!');
        }
        return comment.likesCount;
    }
    if (targetType === 'REPLY') {
        const reply = await reply_model_1.Reply.findById(targetId).select('likesCount');
        if (!reply) {
            throw new apiError_1.ApiError(404, 'Reply not found!');
        }
        return reply.likesCount;
    }
    return like_model_1.Like.countDocuments({ targetType, targetId });
};
const incrementTargetLikeCount = async (targetType, targetId, value) => {
    if (targetType === 'POST') {
        const filter = value === -1 ? { _id: targetId, likesCount: { $gt: 0 } } : { _id: targetId };
        const post = await post_model_1.Post.findOneAndUpdate(filter, { $inc: { likesCount: value } }, { new: true });
        if (!post) {
            throw new apiError_1.ApiError(404, 'Post not found!');
        }
        return post.likesCount;
    }
    if (targetType === 'COMMENT') {
        const filter = value === -1 ? { _id: targetId, likesCount: { $gt: 0 } } : { _id: targetId };
        const comment = await comment_model_1.Comment.findOneAndUpdate(filter, { $inc: { likesCount: value } }, { new: true });
        if (!comment) {
            throw new apiError_1.ApiError(404, 'Comment not found!');
        }
        return comment.likesCount;
    }
    if (targetType === 'REPLY') {
        const filter = value === -1 ? { _id: targetId, likesCount: { $gt: 0 } } : { _id: targetId };
        const reply = await reply_model_1.Reply.findOneAndUpdate(filter, { $inc: { likesCount: value } }, { new: true });
        if (!reply) {
            throw new apiError_1.ApiError(404, 'Reply not found!');
        }
        return reply.likesCount;
    }
    return like_model_1.Like.countDocuments({ targetType, targetId });
};
const getLikedPostIds = async (userId, postIds) => {
    if (postIds.length === 0) {
        return new Set();
    }
    const likes = await like_model_1.Like.find({
        user: userId,
        targetType: 'POST',
        targetId: { $in: postIds },
    }).select('targetId');
    return new Set(likes.map((like) => like.targetId.toString()));
};
exports.getLikedPostIds = getLikedPostIds;
const getLikedCommentIds = async (userId, commentIds) => {
    if (commentIds.length === 0) {
        return new Set();
    }
    const likes = await like_model_1.Like.find({
        user: userId,
        targetType: 'COMMENT',
        targetId: { $in: commentIds },
    }).select('targetId');
    return new Set(likes.map((like) => like.targetId.toString()));
};
exports.getLikedCommentIds = getLikedCommentIds;
const getLikedReplyIds = async (userId, replyIds) => {
    if (replyIds.length === 0) {
        return new Set();
    }
    const likes = await like_model_1.Like.find({
        user: userId,
        targetType: 'REPLY',
        targetId: { $in: replyIds },
    }).select('targetId');
    return new Set(likes.map((like) => like.targetId.toString()));
};
exports.getLikedReplyIds = getLikedReplyIds;
const likeTarget = async (userId, payload) => {
    const { targetType, targetId } = payload;
    await verifyTargetAccess(targetType, targetId, userId);
    const existingLike = await like_model_1.Like.findOne({ user: userId, targetType, targetId });
    if (existingLike) {
        throw new apiError_1.ApiError(409, 'Already liked!');
    }
    try {
        await like_model_1.Like.create({ user: userId, targetType, targetId });
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            throw new apiError_1.ApiError(409, 'Already liked!');
        }
        throw error;
    }
    const likesCount = await incrementTargetLikeCount(targetType, targetId, 1);
    return { hasLiked: true, likesCount };
};
exports.likeTarget = likeTarget;
const unlikeTarget = async (userId, payload) => {
    const { targetType, targetId } = payload;
    await verifyTargetAccess(targetType, targetId, userId);
    const like = await like_model_1.Like.findOneAndDelete({ user: userId, targetType, targetId });
    if (!like) {
        throw new apiError_1.ApiError(404, 'Like not found!');
    }
    const likesCount = await incrementTargetLikeCount(targetType, targetId, -1);
    return { hasLiked: false, likesCount };
};
exports.unlikeTarget = unlikeTarget;
const getLikeStatus = async (userId, payload) => {
    const { targetType, targetId } = payload;
    await verifyTargetAccess(targetType, targetId, userId);
    const [hasLiked, likesCount] = await Promise.all([
        like_model_1.Like.exists({ user: userId, targetType, targetId }),
        getTargetLikesCount(targetType, targetId),
    ]);
    return { hasLiked: Boolean(hasLiked), likesCount };
};
exports.getLikeStatus = getLikeStatus;
const getTargetLikes = async (userId, payload, pagination) => {
    const { targetType, targetId } = payload;
    await verifyTargetAccess(targetType, targetId, userId);
    const filter = { targetType, targetId };
    const { page, limit } = pagination;
    const [likes, total] = await Promise.all([
        like_model_1.Like.find(filter)
            .populate('user', 'firstName lastName email avatar createdAt updatedAt')
            .sort({ createdAt: -1 })
            .skip((0, pagination_util_1.getSkip)(page, limit))
            .limit(limit),
        like_model_1.Like.countDocuments(filter),
    ]);
    const users = likes.filter((like) => like.user).map((like) => toSafeUser(like.user));
    return (0, pagination_util_1.toPaginatedResult)(users, total, page, limit);
};
exports.getTargetLikes = getTargetLikes;
//# sourceMappingURL=like.service.js.map