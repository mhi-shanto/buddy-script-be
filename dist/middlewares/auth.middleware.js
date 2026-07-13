"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const token_util_1 = require("../utils/token.util");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        (0, apiResponse_1.sendError)(res, new apiError_1.ApiError(401, 'Authentication token is missing'));
        return;
    }
    const token = authHeader.slice('Bearer '.length);
    try {
        const payload = (0, token_util_1.verifyAccessToken)(token);
        req.userId = payload.userId;
        next();
    }
    catch {
        (0, apiResponse_1.sendError)(res, new apiError_1.ApiError(401, 'Invalid or expired authentication token'));
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.middleware.js.map