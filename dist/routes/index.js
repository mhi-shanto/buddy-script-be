"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_route_1 = __importDefault(require("./comment.route"));
const like_route_1 = __importDefault(require("./like.route"));
const post_route_1 = __importDefault(require("./post.route"));
const reply_route_1 = __importDefault(require("./reply.route"));
const user_route_1 = __importDefault(require("./user.route"));
const router = (0, express_1.Router)();
router.use('/users', user_route_1.default);
router.use('/posts', post_route_1.default);
router.use('/likes', like_route_1.default);
router.use('/', comment_route_1.default);
router.use('/', reply_route_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map