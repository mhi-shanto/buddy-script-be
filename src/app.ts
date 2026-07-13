import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimit.middleware';

const app: Application = express();

app.use(helmet({ contentSecurityPolicy: env.NODE_ENV === 'production' }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(globalLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

export default app;
