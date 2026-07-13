import z from 'zod';
import { IUser, User } from '../models/user.model';
import {
  loginSchema,
  refreshTokenSchema,
  signupSchema,
  updateUserSchema,
} from '../validation/user.validation';
import { ApiError } from '../utils/apiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.util';
import { compareValue, hashValue } from '../utils/passwrod.util';

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const toSafeUser = (user: IUser): SafeUser => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const issueTokens = async (user: IUser): Promise<AuthTokens> => {
  const accessToken = generateAccessToken({ userId: user._id.toString() });
  const refreshToken = generateRefreshToken({ userId: user._id.toString() });

  user.refreshToken = await hashValue(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
};

export const signup = async (payload: z.infer<typeof signupSchema>): Promise<SafeUser> => {
  const { firstName, lastName, email, password } = payload;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists!');
  }
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: await hashValue(password),
  });
  return toSafeUser(user);
};

export const signin = async (
  payload: z.infer<typeof loginSchema>,
): Promise<{ user: SafeUser; tokens: AuthTokens }> => {
  const { email, password } = payload;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password!');
  }
  const isPasswordValid = await compareValue(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password!');
  }
  const tokens = await issueTokens(user);
  return { user: toSafeUser(user), tokens };
};

export const refreshTokens = async (
  payload: z.infer<typeof refreshTokenSchema>,
): Promise<AuthTokens> => {
  const { incomingRefreshToken } = payload;
  let userPayload;
  try {
    userPayload = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(userPayload.userId).select('+refreshToken');
  if (!user || !user.refreshToken) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const isValid = await compareValue(incomingRefreshToken, user.refreshToken);
  if (!isValid) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const tokens = await issueTokens(user);
  return tokens;
};

export const updateUser = async (
  userId: string,
  payload: z.infer<typeof updateUserSchema>,
): Promise<SafeUser> => {
  const { firstName, lastName, avatar } = payload;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found!');
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { firstName, lastName, avatar },
    { new: true },
  );
  if (!updatedUser) {
    throw new ApiError(404, 'User not found!');
  }
  return toSafeUser(updatedUser as IUser);
};

export const getUserById = async (userId: string): Promise<SafeUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found!');
  }
  return toSafeUser(user);
};

export const logout = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};
