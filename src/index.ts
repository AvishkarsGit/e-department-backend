import { Server } from "./server";

let server = new Server().app;
let port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log("sever is running at port 3000");
});
