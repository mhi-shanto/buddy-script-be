"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.POST_VISIBILITY = void 0;
const mongoose_1 = require("mongoose");
exports.POST_VISIBILITY = ['PUBLIC', 'PRIVATE'];
const postSchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            values: exports.POST_VISIBILITY,
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
}, {
    timestamps: true,
});
postSchema.pre('validate', function () {
    const hasText = Boolean(this.text?.trim());
    const hasImage = Boolean(this.image?.trim());
    if (!hasText && !hasImage) {
        this.invalidate('text', 'Post must have text or image');
    }
});
postSchema.index({ author: 1, createdAt: -1, _id: -1 });
postSchema.index({ visibility: 1, createdAt: -1, _id: -1 });
exports.Post = (0, mongoose_1.model)('Post', postSchema);
//# sourceMappingURL=post.model.js.map