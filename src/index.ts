import { Server } from "./server";

const server = new Server().app;
const port = parseInt(process.env.PORT as string, 10) || 5000;

server.listen(port,'0.0.0.0', () => {
  console.log("server listen at port :", port);
});
