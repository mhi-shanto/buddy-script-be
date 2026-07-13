"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPaginatedResult = exports.buildKeysetFilter = exports.decodeCursor = exports.encodeCursor = exports.getSkip = void 0;
const mongoose_1 = require("mongoose");
const getSkip = (page, limit) => (page - 1) * limit;
exports.getSkip = getSkip;
const encodeCursor = (doc) => Buffer.from(`${doc.createdAt.getTime()}_${doc._id.toString()}`).toString('base64url');
exports.encodeCursor = encodeCursor;
const decodeCursor = (cursor) => {
    if (!cursor) {
        return null;
    }
    try {
        const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
        const separatorIndex = decoded.indexOf('_');
        if (separatorIndex === -1) {
            return null;
        }
        const timestamp = Number(decoded.slice(0, separatorIndex));
        const id = decoded.slice(separatorIndex + 1);
        if (!Number.isFinite(timestamp) || !mongoose_1.Types.ObjectId.isValid(id)) {
            return null;
        }
        return { date: new Date(timestamp), id: new mongoose_1.Types.ObjectId(id) };
    }
    catch {
        return null;
    }
};
exports.decodeCursor = decodeCursor;
const buildKeysetFilter = (cursor) => {
    const parts = (0, exports.decodeCursor)(cursor);
    if (!parts) {
        return {};
    }
    return {
        $or: [
            { createdAt: { $lt: parts.date } },
            { createdAt: parts.date, _id: { $lt: parts.id } },
        ],
    };
};
exports.buildKeysetFilter = buildKeysetFilter;
const toPaginatedResult = (data, total, page, limit) => ({
    data,
    pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
});
exports.toPaginatedResult = toPaginatedResult;
//# sourceMappingURL=pagination.util.js.map