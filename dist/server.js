"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const startServer = async () => {
    await (0, database_1.connectDB)();
    const server = app_1.default.listen(env_1.env.PORT, () => {
        console.log(`Server is running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
    });
    const shutdown = async (signal) => {
        console.log(`${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            await (0, database_1.disconnectDB)();
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled Rejection:', reason);
        server.close(async () => {
            await (0, database_1.disconnectDB)();
            process.exit(1);
        });
    });
};
startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map