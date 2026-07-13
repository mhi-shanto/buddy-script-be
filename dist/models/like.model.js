"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Like = exports.LIKE_TARGET_TYPES = void 0;
const mongoose_1 = require("mongoose");
exports.LIKE_TARGET_TYPES = ['POST', 'COMMENT', 'REPLY'];
const likeSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    targetType: {
        type: String,
        enum: {
            values: exports.LIKE_TARGET_TYPES,
            message: '{VALUE} is not a valid target type',
        },
        required: [true, 'Target type is required'],
    },
    targetId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Target is required'],
    },
}, {
    timestamps: true,
});
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1 });
exports.Like = (0, mongoose_1.model)('Like', likeSchema);
//# sourceMappingURL=like.model.js.map