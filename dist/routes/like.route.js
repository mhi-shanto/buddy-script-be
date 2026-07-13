"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const like_controller_1 = require("../controllers/like.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, like_controller_1.likeTarget);
router.get('/status/:targetType/:targetId', auth_middleware_1.requireAuth, like_controller_1.getLikeStatus);
router.get('/:targetType/:targetId', auth_middleware_1.requireAuth, like_controller_1.getTargetLikes);
router.delete('/:targetType/:targetId', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, like_controller_1.unlikeTarget);
exports.default = router;
//# sourceMappingURL=like.route.js.map