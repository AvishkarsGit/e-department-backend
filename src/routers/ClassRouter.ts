import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { ClassValidator } from "../validators/ClassValidator";
import { ClassController } from "../controllers/ClassController";

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
      "/classes",
      //  GlobalMiddleware.auth,
      ClassController.getClasses
    );
  }

  postRoutes() {
    //create class
    this.router.post(
      "/add",
      // GlobalMiddleware.auth,
      ClassValidator.addClass(),
      GlobalMiddleware.checkError,
      ClassController.addClass
    );
  }

  putRoutes() {}

  patchRoutes() {
    //update
    this.router.patch(
      "/update",
      ClassValidator.updateClass(),
      GlobalMiddleware.checkError,
      ClassController.updateClass
    );
  }

  deleteRoutes() {
    //delete
    this.router.delete("/delete", ClassController.deleteClass);
  }
}

export default new ClassRouter().router;
