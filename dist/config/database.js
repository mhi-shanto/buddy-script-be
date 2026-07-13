"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    if (!env_1.env.MONGO_URL) {
        throw new Error('MONGO_URL is not defined in environment variables');
    }
    await mongoose_1.default.connect(env_1.env.MONGO_URL);
    console.log('MongoDB connected');
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.disconnect();
    console.log('MongoDB disconnected');
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=database.js.map