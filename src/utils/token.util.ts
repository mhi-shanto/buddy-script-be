import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { TokenPayload } from '../types/token.type';

export const generateAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);

export const generateRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
