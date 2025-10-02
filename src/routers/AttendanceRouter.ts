import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { AttendanceController } from "../controllers/AttendanceController";
import { AttendanceValidator } from "../validators/AttendanceValidator";

class AttendanceRouter {
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
    //get all subjects
    this.router.get(
      "/fetch/subjects",
      GlobalMiddleware.auth,
      AttendanceController.getSubjects
    );

    //get all periods
    this.router.get(
      "/fetch/periods",
      GlobalMiddleware.auth,
      AttendanceController.getPeriods
    );

    //fetch all students by class
    this.router.get(
      "/filteredBySubject/:subject_id",
      GlobalMiddleware.auth,
      AttendanceController.fetchStudentsBySubject
    );

    //get all subjects by class
    this.router.get(
      "/fetchSubjectsByClass/:class_id",
      GlobalMiddleware.auth,
      AttendanceController.fetchSubjectsByClass
    );

    // get all classes
    this.router.get(
      "/getClasses",
      GlobalMiddleware.auth,
      AttendanceController.fetchAllClasses
    );

    //filter student attendance
    this.router.get(
      "/filterAttendance",
      GlobalMiddleware.auth,
      AttendanceValidator.filterAttendance(),
      GlobalMiddleware.checkError,
      AttendanceController.fetchAttendanceSummary
    );
  }
  postRoutes() {
    this.router.post(
      "/save",
      GlobalMiddleware.auth,
      AttendanceValidator.saveAttendance(),
      GlobalMiddleware.checkError,
      AttendanceController.saveAttendance
    );
  }
  patchRoutes() {}
  putRoutes() {}
  deleteRoutes() {}
}

export default new AttendanceRouter().router;
