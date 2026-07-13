"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareValue = exports.hashValue = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_constant_1 = require("../constants/auth.constant");
const hashValue = (value) => bcryptjs_1.default.hash(value, auth_constant_1.SALT_ROUNDS);
exports.hashValue = hashValue;
const compareValue = (value, hashed) => bcryptjs_1.default.compare(value, hashed);
exports.compareValue = compareValue;
//# sourceMappingURL=passwrod.util.js.map