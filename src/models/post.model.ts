import { Schema, Types, model, Document } from 'mongoose';

export const POST_VISIBILITY = ['PUBLIC', 'PRIVATE'] as const;
export type PostVisibility = (typeof POST_VISIBILITY)[number];

export interface IPost extends Document {
  author: Types.ObjectId;
  text?: string;
  image?: string;
  visibility: PostVisibility;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },

    text: {
      type: String,
      trim: true,
      maxlength: [5000, 'Text cannot exceed 5000 characters'],
    },

    image: {
      type: String,
      trim: true,
      maxlength: [2048, 'Image URL cannot exceed 2048 characters'],
    },

    visibility: {
      type: String,
      enum: {
        values: POST_VISIBILITY,
        message: '{VALUE} is not a valid visibility',
      },
      default: 'PUBLIC',
    },

    likesCount: {
      type: Number,
      default: 0,
      min: [0, 'Likes count cannot be negative'],
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: [0, 'Comments count cannot be negative'],
    },
  },
  {
    timestamps: true,
  },
);

postSchema.pre('validate', function () {
  const hasText = Boolean(this.text?.trim());
  const hasImage = Boolean(this.image?.trim());

  if (!hasText && !hasImage) {
    this.invalidate('text', 'Post must have text or image');
  }
});

postSchema.index({ author: 1, createdAt: -1, _id: -1 });

postSchema.index({ visibility: 1, createdAt: -1, _id: -1 });

export const Post = model<IPost>('Post', postSchema);
