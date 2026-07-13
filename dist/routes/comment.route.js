"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
const postCommentsRouter = (0, express_1.Router)({ mergeParams: true });
postCommentsRouter.post('/', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, comment_controller_1.createComment);
postCommentsRouter.get('/', auth_middleware_1.requireAuth, comment_controller_1.getCommentsByPost);
router.use('/posts/:postId/comments', postCommentsRouter);
router.get('/comments/:commentId', auth_middleware_1.requireAuth, comment_controller_1.getCommentById);
router.patch('/comments/:commentId', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, comment_controller_1.updateComment);
router.delete('/comments/:commentId', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, comment_controller_1.deleteComment);
exports.default = router;
//# sourceMappingURL=comment.route.js.map