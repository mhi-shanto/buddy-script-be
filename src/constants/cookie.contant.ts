import { CookieOptions } from 'express';
import { env } from '../config/env';

export const REFRESH_TOKEN_COOKIE = 'refreshToken';
export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
