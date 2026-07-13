"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, post_controller_1.createPost);
router.get('/', auth_middleware_1.requireAuth, post_controller_1.getPublicPosts);
router.get('/author/:authorId', auth_middleware_1.requireAuth, post_controller_1.getPostsByAuthor);
router.get('/:postId', auth_middleware_1.requireAuth, post_controller_1.getPostById);
router.patch('/:postId', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, post_controller_1.updatePost);
router.delete('/:postId', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, post_controller_1.deletePost);
exports.default = router;
//# sourceMappingURL=post.route.js.map