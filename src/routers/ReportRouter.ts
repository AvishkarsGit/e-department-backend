import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { AttendanceController } from "../controllers/AttendanceController";
import { AttendanceValidator } from "../validators/AttendanceValidator";
import { ReportController } from "../controllers/ReportController";
import { Utils } from "../utils/Utils";

class ReportRouter {
  public router: Router;

  constructor() {
    this.router = Router();

    this.getRoutes();
    this.postRoutes();
    this.patchRoutes();
    this.putRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
  }
  postRoutes() {

    //upload excel to cloudinary
    this.router.post(
      "/upload",
      GlobalMiddleware.auth,
      new Utils().multer.single("file"),
      ReportController.uploadReport
    );

    //send bulk messages to the whatsapp
    this.router.post(
      "/send/bulk/message",
      GlobalMiddleware.auth,
      ReportController.sendBulkMessage
    );
  }
  patchRoutes() {}
  putRoutes() {}
  deleteRoutes() {}
}

export default new ReportRouter().router;
