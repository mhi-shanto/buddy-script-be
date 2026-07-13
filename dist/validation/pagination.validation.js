"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cursorPaginationSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce
        .number()
        .int('Page must be an integer')
        .min(1, 'Page must be at least 1')
        .default(1),
    limit: zod_1.z.coerce
        .number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .default(10),
});
exports.cursorPaginationSchema = zod_1.z.object({
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce
        .number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(50, 'Limit cannot exceed 50')
        .default(10),
});
//# sourceMappingURL=pagination.validation.js.map