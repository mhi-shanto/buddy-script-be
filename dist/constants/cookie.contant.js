"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenCookieOptions = exports.REFRESH_TOKEN_COOKIE = void 0;
const env_1 = require("../config/env");
exports.REFRESH_TOKEN_COOKIE = 'refreshToken';
exports.refreshTokenCookieOptions = {
    httpOnly: true,
    secure: env_1.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
//# sourceMappingURL=cookie.contant.js.map