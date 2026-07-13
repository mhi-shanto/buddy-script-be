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
exports.deletePost = exports.updatePost = exports.getPostsByAuthor = exports.getPublicPosts = exports.getPostById = exports.createPost = void 0;
const postService = __importStar(require("../services/post.service"));
const pagination_validation_1 = require("../validation/pagination.validation");
const post_validation_1 = require("../validation/post.validation");
const apiResponse_1 = require("../utils/apiResponse");
const createPost = async (req, res) => {
    try {
        const userId = req.userId;
        const payload = post_validation_1.createPostSchema.parse(req.body);
        const post = await postService.createPost(userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 201, 'Post created successfully', post);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.createPost = createPost;
const getPostById = async (req, res) => {
    try {
        const userId = req.userId;
        const { postId } = post_validation_1.postIdParamsSchema.parse(req.params);
        const post = await postService.getPostById(postId, userId);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Post fetched successfully', post);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getPostById = getPostById;
const getPublicPosts = async (req, res) => {
    try {
        const userId = req.userId;
        const pagination = pagination_validation_1.cursorPaginationSchema.parse(req.query);
        const result = await postService.getPublicPosts(userId, pagination);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Posts fetched successfully', result);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getPublicPosts = getPublicPosts;
const getPostsByAuthor = async (req, res) => {
    try {
        const userId = req.userId;
        const { authorId } = post_validation_1.authorIdParamsSchema.parse(req.params);
        const pagination = pagination_validation_1.cursorPaginationSchema.parse(req.query);
        const result = await postService.getPostsByAuthor(authorId, userId, pagination);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Posts fetched successfully', result);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getPostsByAuthor = getPostsByAuthor;
const updatePost = async (req, res) => {
    try {
        const userId = req.userId;
        const { postId } = post_validation_1.postIdParamsSchema.parse(req.params);
        const payload = post_validation_1.updatePostSchema.parse(req.body);
        const post = await postService.updatePost(postId, userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Post updated successfully', post);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    try {
        const userId = req.userId;
        const { postId } = post_validation_1.postIdParamsSchema.parse(req.params);
        await postService.deletePost(postId, userId);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Post deleted successfully');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.deletePost = deletePost;
//# sourceMappingURL=post.controller.js.map