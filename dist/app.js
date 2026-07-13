"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const env_1 = require("./config/env");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({ contentSecurityPolicy: env_1.env.NODE_ENV === 'production' }));
app.use((0, cors_1.default)({ origin: env_1.env.CLIENT_URL, credentials: true }));
app.use(rateLimit_middleware_1.globalLimiter);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map