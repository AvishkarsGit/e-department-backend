import * as express from "express";
import * as dotenv from "dotenv";
dotenv.config(); //config dotenv
import UserRouter from "./routers/UserRouter";
import * as bodyParser from "body-parser";
import mongoose from "mongoose";
import * as cors from "cors";
import { getEnvironmentVariables } from "./environments/environment";
import FacultyRouter from "./routers/FacultyRouter";

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
    this.app.use("/api/faculty", FacultyRouter);
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
