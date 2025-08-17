import * as express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { getEnvironmentVariables } from "./environment/environment";
import UserRouter from "./routers/UserRouter";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import path = require("path");
export class Server {
  public app = express();

  constructor() {
    this.setConfigs();
    this.setRoutes();
  }

  setConfigs() {
    //this.dotenvConfig();
    this.connectMongoDB();
    this.allowCors();
    this.configureBodyParser();
  }

  configureBodyParser() {
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );

    // this.app.use(bodyParser.json());
  }

  dotenvConfig() {
    dotenv.config();
  }

  setRoutes() {
    this.app.use("/api/users/", UserRouter);
  }

  connectMongoDB() {
    mongoose.connect(getEnvironmentVariables().db_uri).then(() => {
      console.log("DB connected...");
    });
  }

  allowCors() {
    this.app.use(cors());
  }
}
