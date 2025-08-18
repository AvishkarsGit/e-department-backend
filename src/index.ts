import { Server } from "./server";

let server = new Server().app;
const port = process.env.PORT || 4000;

server.listen(port, () => {
  //console.log(`sever is running at port ${port}`);
  console.log(` server is running at port ${port}`);
});
