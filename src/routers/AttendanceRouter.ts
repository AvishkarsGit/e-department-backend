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
      GlobalMiddleware.checkRole("admin", "faculty"),
      AttendanceController.getSubjects
    );

    //get all periods
    this.router.get(
      "/fetch/periods",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      AttendanceController.getPeriods
    );

    //fetch all students by class
    this.router.get(
      "/filteredBySubject/:subject_id",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      AttendanceController.fetchStudentsBySubject
    );

    //get all subjects by class
    this.router.get(
      "/fetchSubjectsByClass/:class_id",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty","student"),
      AttendanceController.fetchSubjectsByClass
    );

    // get all classes
    this.router.get(
      "/getClasses",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      AttendanceController.fetchAllClasses
    );

    //filter student attendance
    this.router.get(
      "/filterAttendance",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      AttendanceValidator.filterAttendance(),
      GlobalMiddleware.checkError,
      AttendanceController.fetchAttendanceSummary
    );

    //filtered student attendance for export to excel
    this.router.get(
      "/filterAttendanceExcel",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      AttendanceValidator.fetchAttendanceSummaryExcel(),
      GlobalMiddleware.checkError,
      AttendanceController.fetchAttendanceSummaryExcel
    );

    //get particular student attendance.
    this.router.get(
      "/getStudentAttendance",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      AttendanceValidator.getStudentAttendance(),
      GlobalMiddleware.checkError,
      AttendanceController.getStudentAttendance
    );

    //get all dates for the particular subject attendance
    this.router.get(
      "/fetchAllAttendanceDate",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      AttendanceValidator.fetchAllAttendanceDate(),
      GlobalMiddleware.checkError,
      AttendanceController.fetchAllAttendanceDate
    );

    // fetch attendance for students only
    this.router.get(
      "/student/attendance",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("student"),
      AttendanceValidator.studentAttendance(),
      GlobalMiddleware.checkError,
      AttendanceController.studentAttendance
    );

    //retrieve total attendance
    this.router.get(
      "/fetchAllAttendance",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      AttendanceController.fetchAllAttendance
    );
  }
  postRoutes() {
    this.router.post(
      "/save",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
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
