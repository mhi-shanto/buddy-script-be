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
exports.logout = exports.getUserById = exports.getCurrentUser = exports.updateUser = exports.refreshTokens = exports.signin = exports.signup = void 0;
const userService = __importStar(require("../services/user.service"));
const apiResponse_1 = require("../utils/apiResponse");
const user_validation_1 = require("../validation/user.validation");
const signup = async (req, res) => {
    try {
        const payload = user_validation_1.signupSchema.parse(req.body);
        const user = await userService.signup(payload);
        (0, apiResponse_1.sendSuccess)(res, 201, 'User created successfully', user);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.signup = signup;
const signin = async (req, res) => {
    try {
        const payload = user_validation_1.loginSchema.parse(req.body);
        const { user, tokens } = await userService.signin(payload);
        (0, apiResponse_1.sendSuccess)(res, 200, 'User signed in successfully', {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.signin = signin;
const refreshTokens = async (req, res) => {
    try {
        const { incomingRefreshToken } = user_validation_1.refreshTokenSchema.parse(req.body);
        const { accessToken, refreshToken } = await userService.refreshTokens({
            incomingRefreshToken,
        });
        (0, apiResponse_1.sendSuccess)(res, 200, 'Tokens refreshed successfully', { accessToken, refreshToken });
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.refreshTokens = refreshTokens;
const updateUser = async (req, res) => {
    try {
        const userId = req.userId;
        const payload = user_validation_1.updateUserSchema.parse(req.body);
        const user = await userService.updateUser(userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 200, 'User updated successfully', user);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.updateUser = updateUser;
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userService.getUserById(userId);
        (0, apiResponse_1.sendSuccess)(res, 200, 'User fetched successfully', user);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getCurrentUser = getCurrentUser;
const getUserById = async (req, res) => {
    try {
        const { userId } = user_validation_1.userIdParamsSchema.parse(req.params);
        const user = await userService.getUserById(userId);
        (0, apiResponse_1.sendSuccess)(res, 200, 'User fetched successfully', user);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getUserById = getUserById;
const logout = async (req, res) => {
    try {
        const userId = req.userId;
        await userService.logout(userId);
        (0, apiResponse_1.sendSuccess)(res, 200, 'User logged out successfully');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.logout = logout;
//# sourceMappingURL=user.controller.js.map