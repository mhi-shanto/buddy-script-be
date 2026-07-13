import { Schema, Types, model, Document } from 'mongoose';

export const LIKE_TARGET_TYPES = ['POST', 'COMMENT', 'REPLY'] as const;
export type LikeTargetType = (typeof LIKE_TARGET_TYPES)[number];

export interface ILike extends Document {
  user: Types.ObjectId;
  targetType: LikeTargetType;
  targetId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    targetType: {
      type: String,
      enum: {
        values: LIKE_TARGET_TYPES,
        message: '{VALUE} is not a valid target type',
      },
      required: [true, 'Target type is required'],
    },

    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Target is required'],
    },
  },
  {
    timestamps: true,
  },
);

likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

likeSchema.index({ targetType: 1, targetId: 1 });

export const Like = model<ILike>('Like', likeSchema);
