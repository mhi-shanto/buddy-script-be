"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    post: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Post is required'],
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
commentSchema.index({ post: 1, createdAt: -1 });
exports.Comment = (0, mongoose_1.model)('Comment', commentSchema);
//# sourceMappingURL=comment.model.js.map