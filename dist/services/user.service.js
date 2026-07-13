"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getUserById = exports.updateUser = exports.refreshTokens = exports.signin = exports.signup = void 0;
const user_model_1 = require("../models/user.model");
const apiError_1 = require("../utils/apiError");
const token_util_1 = require("../utils/token.util");
const passwrod_util_1 = require("../utils/passwrod.util");
const toSafeUser = (user) => ({
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
const issueTokens = async (user) => {
    const accessToken = (0, token_util_1.generateAccessToken)({ userId: user._id.toString() });
    const refreshToken = (0, token_util_1.generateRefreshToken)({ userId: user._id.toString() });
    user.refreshToken = await (0, passwrod_util_1.hashValue)(refreshToken);
    await user.save();
    return { accessToken, refreshToken };
};
const signup = async (payload) => {
    const { firstName, lastName, email, password } = payload;
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser) {
        throw new apiError_1.ApiError(409, 'User with this email already exists!');
    }
    const user = await user_model_1.User.create({
        firstName,
        lastName,
        email,
        password: await (0, passwrod_util_1.hashValue)(password),
    });
    return toSafeUser(user);
};
exports.signup = signup;
const signin = async (payload) => {
    const { email, password } = payload;
    const user = await user_model_1.User.findOne({ email }).select('+password');
    if (!user) {
        throw new apiError_1.ApiError(401, 'Invalid email or password!');
    }
    const isPasswordValid = await (0, passwrod_util_1.compareValue)(password, user.password);
    if (!isPasswordValid) {
        throw new apiError_1.ApiError(401, 'Invalid email or password!');
    }
    const tokens = await issueTokens(user);
    return { user: toSafeUser(user), tokens };
};
exports.signin = signin;
const refreshTokens = async (payload) => {
    const { incomingRefreshToken } = payload;
    let userPayload;
    try {
        userPayload = (0, token_util_1.verifyRefreshToken)(incomingRefreshToken);
    }
    catch {
        throw new apiError_1.ApiError(401, 'Invalid or expired refresh token');
    }
    const user = await user_model_1.User.findById(userPayload.userId).select('+refreshToken');
    if (!user || !user.refreshToken) {
        throw new apiError_1.ApiError(401, 'Invalid or expired refresh token');
    }
    const isValid = await (0, passwrod_util_1.compareValue)(incomingRefreshToken, user.refreshToken);
    if (!isValid) {
        throw new apiError_1.ApiError(401, 'Invalid or expired refresh token');
    }
    const tokens = await issueTokens(user);
    return tokens;
};
exports.refreshTokens = refreshTokens;
const updateUser = async (userId, payload) => {
    const { firstName, lastName, avatar } = payload;
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new apiError_1.ApiError(404, 'User not found!');
    }
    const updatedUser = await user_model_1.User.findByIdAndUpdate(userId, { firstName, lastName, avatar }, { new: true });
    if (!updatedUser) {
        throw new apiError_1.ApiError(404, 'User not found!');
    }
    return toSafeUser(updatedUser);
};
exports.updateUser = updateUser;
const getUserById = async (userId) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new apiError_1.ApiError(404, 'User not found!');
    }
    return toSafeUser(user);
};
exports.getUserById = getUserById;
const logout = async (userId) => {
    await user_model_1.User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};
exports.logout = logout;
//# sourceMappingURL=user.service.js.map