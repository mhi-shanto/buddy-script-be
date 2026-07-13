"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reply_controller_1 = require("../controllers/reply.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
const commentRepliesRouter = (0, express_1.Router)({ mergeParams: true });
commentRepliesRouter.post('/', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, reply_controller_1.createReply);
commentRepliesRouter.get('/', auth_middleware_1.requireAuth, reply_controller_1.getRepliesByComment);
router.use('/comments/:commentId/replies', commentRepliesRouter);
router.get('/replies/:replyId', auth_middleware_1.requireAuth, reply_controller_1.getReplyById);
router.patch('/replies/:replyId', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, reply_controller_1.updateReply);
router.delete('/replies/:replyId', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, reply_controller_1.deleteReply);
exports.default = router;
//# sourceMappingURL=reply.route.js.map