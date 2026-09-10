const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

// Connect to MongoDB
connectDB().then(() => {
  const PORT = env.PORT;
  const server = app.listen(PORT, () => {
    console.log(`[SupportDesk Server] Running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection]: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
