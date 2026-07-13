import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { env } from './config/env';

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
