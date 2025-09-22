import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { AttendanceValidator } from "../validators/AttendanceValidator";
import { AttendanceController } from "../controllers/AttendanceController";

class AttendanceRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.putRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
    //filter student by class
    this.router.get(
      "/filteredBySubject",
      //GlobalMiddleware.auth,
      AttendanceValidator.filteredBySubject(),
      GlobalMiddleware.checkError,
      AttendanceController.getStudentsBySubject
    );

    //get all subjects
    this.router.get(
      "/getSubjects",
      //GlobalMiddleware.auth,
      AttendanceController.getAllSubjects
    );

  }
  postRoutes() {
    //save/mark attendance
    this.router.post("/save", AttendanceController.saveAttendance);
  }
  putRoutes() {}
  patchRoutes() {}
  deleteRoutes() {}
}

export default new AttendanceRouter().router;
