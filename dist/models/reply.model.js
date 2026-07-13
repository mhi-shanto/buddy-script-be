"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reply = void 0;
const mongoose_1 = require("mongoose");
const replySchema = new mongoose_1.Schema({
    comment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Comment',
        required: [true, 'Comment is required'],
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
}, {
    timestamps: true,
});
replySchema.index({ comment: 1, createdAt: 1 });
exports.Reply = (0, mongoose_1.model)('Reply', replySchema);
//# sourceMappingURL=reply.model.js.map