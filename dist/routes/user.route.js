"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post('/signup', rateLimit_middleware_1.authLimiter, user_controller_1.signup);
router.post('/signin', rateLimit_middleware_1.authLimiter, user_controller_1.signin);
router.post('/refresh-token', rateLimit_middleware_1.authLimiter, user_controller_1.refreshTokens);
router.post('/logout', auth_middleware_1.requireAuth, user_controller_1.logout);
router.get('/me', auth_middleware_1.requireAuth, user_controller_1.getCurrentUser);
router.patch('/me', auth_middleware_1.requireAuth, rateLimit_middleware_1.writeLimiter, user_controller_1.updateUser);
router.get('/:userId', auth_middleware_1.requireAuth, user_controller_1.getUserById);
exports.default = router;
//# sourceMappingURL=user.route.js.map