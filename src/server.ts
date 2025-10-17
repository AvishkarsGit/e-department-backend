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
import { v2 as cloudinary } from "cloudinary";
import StudentsRouter from "./routers/StudentsRouter";
import FacultyRouter from "./routers/FacultyRouter";
import AttendanceRouter from "./routers/AttendanceRouter";
import PeriodsRouter from "./routers/PeriodsRouter";
import ReportRouter from "./routers/ReportRouter";

export class Server {
  public app = express();

  constructor() {
    this.setConfigs();
    this.setRoutes();
    this.error404Handler();
    this.handleErrors();
  }

  setConfigs() {
    this.connectMongoDB();
    this.allowCors();
    this.configBodyParser();
    this.configCloudinary();
  }

  setRoutes() {
    // multer
    this.app.use("/src/uploads", express.static("src/uploads"));

    //routes
    this.app.use("/api/user", UserRouter);
    this.app.use("/api/department", DepartmentRouter);
    this.app.use("/api/class", ClassRouter);
    this.app.use("/api/subject", SubjectRouter);
    this.app.use("/api/student", StudentsRouter);
    this.app.use("/api/faculty", FacultyRouter);
    this.app.use("/api/attendance", AttendanceRouter);
    this.app.use("/api/periods", PeriodsRouter);
    this.app.use("/api/reports", ReportRouter);
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

  error404Handler() {
    this.app.use((req, res) => {
      res.status(404).json({
        message: "Not found",
        status_code: 404,
      });
    });
  }

  handleErrors() {
    this.app.use((error, req, res, next) => {
      const errorStatus = req.errorStatus || 500;
      res.status(errorStatus).json({
        message: error.message || "Something went wrong. Please try again!",
        status_code: errorStatus,
      });
    });
  }

  configCloudinary() {
    cloudinary.config({
      cloud_name: getEnvironmentVariables().cloud_name,
      api_key: getEnvironmentVariables().cloud_api_key,
      api_secret: getEnvironmentVariables().cloud_api_secret,
    });
  }
}
