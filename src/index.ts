import { Server } from "./server";

const server = new Server().app;
const port = parseInt(process.env.PORT as string, 10) || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

server.listen(port,'0.0.0.0', () => {
  console.log("server listen at port :", port);
});
