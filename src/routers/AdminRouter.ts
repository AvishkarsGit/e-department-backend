import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { AdminController } from "../controllers/AdminController";
import { AdminValidator } from "../validators/AdminValidator";

class AdminRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.getRoutes();
    this.putRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }

  getRoutes() {}
  postRoutes() {
    //create faculty
    this.router.post(
      "/create-faculty",
      GlobalMiddleware.auth,
      AdminValidator.createFaculty(),
      GlobalMiddleware.checkError,
      AdminController.createFaculty
    );

   
    //department
    this.router.post(
      "/add-department",
      AdminValidator.addDepartment(),
      GlobalMiddleware.checkError,
      AdminController.addDepartment
    );
  }
  putRoutes() {}
  patchRoutes() {}
  deleteRoutes() {
  }
}
export default new AdminRouter().router;
