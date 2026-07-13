import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import {
  loginSchema,
  refreshTokenSchema,
  signupSchema,
  updateUserSchema,
  userIdParamsSchema,
} from '../validation/user.validation';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = signupSchema.parse(req.body);
    const user = await userService.signup(payload);
    sendSuccess(res, 201, 'User created successfully', user);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = loginSchema.parse(req.body);
    const { user, tokens } = await userService.signin(payload);
    sendSuccess(res, 200, 'User signed in successfully', {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const refreshTokens = async (req: Request, res: Response): Promise<void> => {
  try {
    const { incomingRefreshToken } = refreshTokenSchema.parse(req.body);
    const { accessToken, refreshToken } = await userService.refreshTokens({
      incomingRefreshToken,
    });
    sendSuccess(res, 200, 'Tokens refreshed successfully', { accessToken, refreshToken });
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const payload = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(userId, payload);
    sendSuccess(res, 200, 'User updated successfully', user);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;
    const user = await userService.getUserById(userId);
    sendSuccess(res, 200, 'User fetched successfully', user);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = userIdParamsSchema.parse(req.params);
    const user = await userService.getUserById(userId);
    sendSuccess(res, 200, 'User fetched successfully', user);
  } catch (error) {
    sendError(res, error as ApiError);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    await userService.logout(userId as string);
    sendSuccess(res, 200, 'User logged out successfully');
  } catch (error) {
    sendError(res, error as ApiError);
  }
};
