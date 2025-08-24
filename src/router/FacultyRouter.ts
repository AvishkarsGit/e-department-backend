import { Router } from "express";
import { FacultyValidator } from "../validator/FacultyValidator";
import { GlobalMiddleware } from "../middleware/GlobalMiddleware";
import { FacultyController } from "../controller/FacultyController";

class FacultyRouter {
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
    //get profile
    this.router.get(
      "/profile",
      GlobalMiddleware.auth,
      FacultyController.profile
    );
  }

  postRoutes() {
    //login
    this.router.post(
      "/login",
      FacultyValidator.login(),
      GlobalMiddleware.checkError,
      FacultyController.login
    );
  }

  putRoutes() {}

  patchRoutes() {
        
  }

  deleteRoutes() {}
}

export default new FacultyRouter().router;
