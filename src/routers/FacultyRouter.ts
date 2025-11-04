import { Router } from "express";
import { Utils } from "../utils/Utils";
import { FacultyValidator } from "../validators/FacultyValidator";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { FacultyController } from "../controllers/FacultyController";

class ClassRouter {
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
    this.router.get(
      "/get-faculty",
      GlobalMiddleware.auth,
      FacultyController.getFaculty
    );
    this.router.get(
      "/get-all-faculty",
      GlobalMiddleware.auth,
      FacultyController.getAllFaculties
    );
  }

  postRoutes() {
    //create class
    this.router.post(
      "/create-faculty",
      // GlobalMiddleware.auth,
      new Utils().multer.single("photo"),
      FacultyValidator.addFaculty(),
      FacultyController.createFaculty
    );


  }

  putRoutes() {}

  patchRoutes() {
    //update
    this.router.patch(
      "/update-faculty/:user_id/:id",
      GlobalMiddleware.auth,
      new Utils().multer.single("photo"),
      FacultyValidator.updateFaculty(),
      GlobalMiddleware.checkError,
      FacultyController.updateFaculty
    );

    //assign faculty
    this.router.patch(
      "/assign-faculty",
      GlobalMiddleware.auth,
      FacultyValidator.assignSubjects(),
      GlobalMiddleware.checkError,
      FacultyController.assignSubjects
    );
  }

  deleteRoutes() {
    //delete
    this.router.delete(
      "/delete-faculty/:user_id/:id",
      GlobalMiddleware.auth,
      FacultyController.deleteFaculty
    );
  }
}

export default new ClassRouter().router;
