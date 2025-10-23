import { Router } from 'express';
import { DepartmentController } from '../controllers/DepartmentController';
import { DepartmentValidator } from '../validators/DepartmentValidator';
import { GlobalMiddleware } from '../middlewares/GlobalMiddleware';

class DepartmentRouter {
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
    this.router.get("/get-department", DepartmentController.readDepartment);
  }

  postRoutes() {
    this.router.post(
      "/create-department",
      DepartmentValidator.createDepartment(),
      GlobalMiddleware.checkError,
      DepartmentController.createDepartment
    );
  }
  deleteRoutes() {
    this.router.delete(
      "/delete-department",
      // GlobalMiddleware.auth,
      DepartmentController.deleteDepartment
    );
  }
  patchRoutes() {
    this.router.patch(
      "/update-department",
      DepartmentController.updateDepartment
    );
  }

  putRoutes() {
    
  }
}

export default new DepartmentRouter().router;
