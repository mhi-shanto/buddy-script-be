import { Schema, Types, model, Document } from 'mongoose';

export interface IComment extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required'],
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },

    text: {
      type: String,
      required: [true, 'Text is required'],
      trim: true,
      maxlength: [2000, 'Text cannot exceed 2000 characters'],
    },

    likesCount: {
      type: Number,
      default: 0,
      min: [0, 'Likes count cannot be negative'],
    },

    repliesCount: {
      type: Number,
      default: 0,
      min: [0, 'Replies count cannot be negative'],
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ post: 1, createdAt: -1 });

export const Comment = model<IComment>('Comment', commentSchema);
