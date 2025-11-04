import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { DepartmentController } from "../controllers/DepartmentController";
import { DepartmentValidator } from "../validators/DepartmentValidator";

class DepartmentRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
    this.router.get(
      "/get-department",
      GlobalMiddleware.auth,
      DepartmentController.getDepartments
    );

    //get all departments
    this.router.get(
      "/get-all-departments",
     // GlobalMiddleware.auth,
      DepartmentController.getAllDepartments
    );
  }

  postRoutes() {
    this.router.post(
      "/create-department",
      GlobalMiddleware.auth,
      DepartmentValidator.createDepartment(),
      GlobalMiddleware.checkError,
      DepartmentController.createDepartment
    );
  }
  deleteRoutes() {
    this.router.delete(
      "/delete-department/:id",
      GlobalMiddleware.auth,
      DepartmentController.deleteDepartment
    );
  }
  patchRoutes() {
    this.router.patch(
      "/update-department/:id",
      GlobalMiddleware.auth,
      DepartmentController.updateDepartment
    );
  }
}

export default new DepartmentRouter().router;


