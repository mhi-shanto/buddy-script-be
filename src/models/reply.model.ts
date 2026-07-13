import { Schema, Types, model, Document } from 'mongoose';

export interface IReply extends Document {
  comment: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new Schema<IReply>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: [true, 'Comment is required'],
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
  },
  {
    timestamps: true,
  },
);

replySchema.index({ comment: 1, createdAt: 1 });

export const Reply = model<IReply>('Reply', replySchema);
