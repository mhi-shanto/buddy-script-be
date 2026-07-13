"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTargetLikes = exports.getLikeStatus = exports.unlikeTarget = exports.likeTarget = void 0;
const likeService = __importStar(require("../services/like.service"));
const like_validation_1 = require("../validation/like.validation");
const pagination_validation_1 = require("../validation/pagination.validation");
const apiResponse_1 = require("../utils/apiResponse");
const likeTarget = async (req, res) => {
    try {
        const userId = req.userId;
        const payload = like_validation_1.likeTargetSchema.parse(req.body);
        const result = await likeService.likeTarget(userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 201, 'Liked successfully', result);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.likeTarget = likeTarget;
const unlikeTarget = async (req, res) => {
    try {
        const userId = req.userId;
        const payload = like_validation_1.likeTargetParamsSchema.parse(req.params);
        const result = await likeService.unlikeTarget(userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Unliked successfully', result);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.unlikeTarget = unlikeTarget;
const getLikeStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const payload = like_validation_1.likeTargetParamsSchema.parse(req.params);
        const result = await likeService.getLikeStatus(userId, payload);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Like status fetched successfully', result);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getLikeStatus = getLikeStatus;
const getTargetLikes = async (req, res) => {
    try {
        const userId = req.userId;
        const payload = like_validation_1.likeTargetParamsSchema.parse(req.params);
        const pagination = pagination_validation_1.paginationSchema.parse(req.query);
        const result = await likeService.getTargetLikes(userId, payload, pagination);
        (0, apiResponse_1.sendSuccess)(res, 200, 'Likes fetched successfully', result);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, error);
    }
};
exports.getTargetLikes = getTargetLikes;
//# sourceMappingURL=like.controller.js.map