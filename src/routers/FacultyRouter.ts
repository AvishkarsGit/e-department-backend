import { Router } from "express";
import { FacultyController } from "../controllers/facultyController";
import { Utils } from "../utils/Utils";
import { FacultyValidator } from "../validators/FacultyValidator";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";

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
     FacultyController.getFaculty
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
