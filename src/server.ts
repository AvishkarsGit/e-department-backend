import * as express from "express";
import * as dotenv from "dotenv";
dotenv.config(); //config dotenv
import UserRouter from "./routers/UserRouter";
import * as bodyParser from "body-parser";
import mongoose from "mongoose";
import * as cors from "cors";
import { getEnvironmentVariables } from "./environments/environment";
import DepartmentRouter from "./routers/DepartmentRouter";
import ClassRouter from "./routers/ClassRouter";
import SubjectRouter from "./routers/SubjectRouter";

export class Server {
  public app = express();

  constructor() {
    this.setConfigs();
    this.setRoutes();
  }

  setConfigs() {
    this.connectMongoDB();
    this.allowCors();
    this.configBodyParser();
  }

  setRoutes() {
    this.app.use("/api/user", UserRouter);
    this.app.use("/api/department", DepartmentRouter);
    this.app.use("/api/class", ClassRouter);
    this.app.use("/api/subject",SubjectRouter);
  }

  connectMongoDB() {
    mongoose
      .connect(getEnvironmentVariables().db_uri)
      .then(() => {
        console.log("mongodb connected");
      })
      .catch((err) => {
        console.log("error:", err);
      });
  }

  configBodyParser() {
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );

    this.app.use(bodyParser.json());
  }

  allowCors() {
    this.app.use(cors());
  }
}
