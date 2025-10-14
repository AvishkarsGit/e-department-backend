import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { Utils } from "../utils/Utils";
import { StudentValidator } from "../validators/StudentValidator";
import { StudentController } from "../controllers/StudentController";

class StudentsRouter {
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
    //get all students data
    this.router.get(
      "/students",
      GlobalMiddleware.auth,
      StudentController.getStudents
    );

    //get all students data for excel export
    this.router.get(
      "/students/export",
      GlobalMiddleware.auth,
      StudentController.getStudentsForExcel
    );
  }

  postRoutes() {
    this.router.post(
      "/add",
      GlobalMiddleware.auth,
      new Utils().multer.single("photo"),
      StudentValidator.addStudent(),
      GlobalMiddleware.checkError,
      StudentController.addStudent
    );
  }

  putRoutes() {}

  patchRoutes() {
    //update data
    this.router.patch(
      "/update/:user_id/:id",
      GlobalMiddleware.auth,
      new Utils().multer.single("photo"),
      StudentValidator.updateStudent(),
      GlobalMiddleware.checkError,
      StudentController.updateStudent
    );
  }

  deleteRoutes() {

    //delete data
    this.router.delete('/delete/:user_id/:id',
      GlobalMiddleware.auth,
      StudentController.deleteStudent
    )
  }
}

export default new StudentsRouter().router;
