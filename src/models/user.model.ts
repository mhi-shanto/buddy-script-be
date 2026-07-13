import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
