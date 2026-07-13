"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.getPublicPosts = exports.getPostsByAuthor = exports.getPostById = exports.createPost = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = require("../models/post.model");
const apiError_1 = require("../utils/apiError");
const pagination_util_1 = require("../utils/pagination.util");
const like_service_1 = require("./like.service");
const comment_model_1 = require("../models/comment.model");
const reply_model_1 = require("../models/reply.model");
const like_model_1 = require("../models/like.model");
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
const toSafePost = (post, hasLiked) => ({
    id: post._id.toString(),
    author: toSafeUser(post.author),
    text: post.text,
    image: post.image,
    visibility: post.visibility,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    hasLiked,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
});
const toPopulatedPosts = (posts) => posts
    .filter((post) => {
    const author = post.author;
    return author && typeof author !== 'string';
})
    .map((post) => post);
const populatePostAuthor = async (postId) => {
    const populatedPost = await post_model_1.Post.findById(postId).populate('author', AUTHOR_SELECT);
    if (!populatedPost || !populatedPost.author || typeof populatedPost.author === 'string') {
        throw new apiError_1.ApiError(404, 'Post author not found!');
    }
    return populatedPost;
};
const toSafePostsWithLikeState = async (posts, requesterId) => {
    const postIds = posts.map((post) => post._id.toString());
    const likedPostIds = await (0, like_service_1.getLikedPostIds)(requesterId, postIds);
    return posts.map((post) => toSafePost(post, likedPostIds.has(post._id.toString())));
};
const createPost = async (authorId, payload) => {
    const { text, image, visibility } = payload;
    const post = await post_model_1.Post.create({
        author: authorId,
        text,
        image,
        visibility,
    });
    const populatedPost = await populatePostAuthor(post._id.toString());
    return toSafePost(populatedPost, false);
};
exports.createPost = createPost;
const getPostById = async (postId, requesterId) => {
    const post = await post_model_1.Post.findById(postId).populate('author', AUTHOR_SELECT);
    if (!post) {
        throw new apiError_1.ApiError(404, 'Post not found!');
    }
    if (post.visibility === 'PRIVATE' &&
        post.author &&
        typeof post.author !== 'string' &&
        post.author._id.toString() !== requesterId) {
        throw new apiError_1.ApiError(403, 'You do not have access to this post!');
    }
    if (!post.author || typeof post.author === 'string') {
        throw new apiError_1.ApiError(404, 'Post author not found!');
    }
    const likedPostIds = await (0, like_service_1.getLikedPostIds)(requesterId, [postId]);
    return toSafePost(post, likedPostIds.has(postId));
};
exports.getPostById = getPostById;
const paginatePostsByFilter = async (filter, requesterId, { cursor, limit }) => {
    const query = { ...filter, ...(0, pagination_util_1.buildKeysetFilter)(cursor) };
    const docs = await post_model_1.Post.find(query)
        .populate('author', AUTHOR_SELECT)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1);
    const hasNextPage = docs.length > limit;
    const pageDocs = hasNextPage ? docs.slice(0, limit) : docs;
    const lastDoc = pageDocs[pageDocs.length - 1];
    const data = await toSafePostsWithLikeState(toPopulatedPosts(pageDocs), requesterId);
    return {
        data,
        nextCursor: hasNextPage && lastDoc
            ? (0, pagination_util_1.encodeCursor)({ createdAt: lastDoc.createdAt, _id: lastDoc._id.toString() })
            : null,
        hasNextPage,
    };
};
const getPostsByAuthor = async (authorId, requesterId, pagination) => {
    const isOwner = authorId === requesterId;
    const filter = isOwner
        ? { author: authorId }
        : { author: authorId, visibility: 'PUBLIC' };
    return paginatePostsByFilter(filter, requesterId, pagination);
};
exports.getPostsByAuthor = getPostsByAuthor;
const getPublicPosts = async (requesterId, pagination) => {
    return paginatePostsByFilter({ visibility: 'PUBLIC' }, requesterId, pagination);
};
exports.getPublicPosts = getPublicPosts;
const updatePost = async (postId, authorId, payload) => {
    const post = await post_model_1.Post.findOne({ _id: postId, author: authorId });
    if (!post) {
        throw new apiError_1.ApiError(404, 'Post not found!');
    }
    const updatedPost = await post_model_1.Post.findByIdAndUpdate(postId, payload, {
        new: true,
        runValidators: true,
    });
    if (!updatedPost) {
        throw new apiError_1.ApiError(404, 'Post not found!');
    }
    const populatedPost = await populatePostAuthor(postId);
    const likedPostIds = await (0, like_service_1.getLikedPostIds)(authorId, [postId]);
    return toSafePost(populatedPost, likedPostIds.has(postId));
};
exports.updatePost = updatePost;
const deletePost = async (postId, authorId) => {
    const post = await post_model_1.Post.findOne({ _id: postId, author: authorId });
    if (!post) {
        throw new apiError_1.ApiError(404, 'Post not found!');
    }
    await deletePostById(postId);
};
exports.deletePost = deletePost;
const deletePostById = async (postId) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const comments = await comment_model_1.Comment.find({ post: postId }).select('_id').session(session);
        const commentIds = comments.map((comment) => comment._id);
        const replies = await reply_model_1.Reply.find({ comment: { $in: commentIds } })
            .select('_id')
            .session(session);
        const replyIds = replies.map((reply) => reply._id);
        await like_model_1.Like.deleteMany({
            $or: [
                { targetType: 'POST', targetId: postId },
                { targetType: 'COMMENT', targetId: { $in: commentIds } },
                { targetType: 'REPLY', targetId: { $in: replyIds } },
            ],
        }).session(session);
        await reply_model_1.Reply.deleteMany({ comment: { $in: commentIds } }).session(session);
        await comment_model_1.Comment.deleteMany({ post: postId }).session(session);
        await post_model_1.Post.findByIdAndDelete(postId).session(session);
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
//# sourceMappingURL=post.service.js.map