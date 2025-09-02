import { Router } from 'express';
import { DepartmentController } from '../controllers/DepartmentController';
import { DepartmentValidator } from '../validators/DepartmentValidator';
import { GlobalMiddleware } from '../middlewares/GlobalMiddleware';

class DepartmentRouter {
    public router: Router;
    constructor() {
        this.router = Router();
        this.getroutes();
        this.postroutes();
        this.patchroutes();
        this.deleteroutes();
    }

    getroutes() {
        this.router.get(
            "/get-department",
            DepartmentController.readDepartment
        )

    }

    postroutes() {
        this.router.post(
            "/create-department",
            DepartmentValidator.createDepartment(),
            GlobalMiddleware.checkError,
            DepartmentController.createDepartment
        )

    }
    deleteroutes() {
        this.router.delete(
            "/delete-department",
            // GlobalMiddleware.auth,
            DepartmentController.deleteDepartment
        )
    }
    patchroutes() {
        this.router.patch(
            "/update-department",
            DepartmentController.updateDepartment
        )
    }

}

export default new DepartmentRouter().router;