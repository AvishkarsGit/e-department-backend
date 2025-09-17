import { Router } from 'express';
import { FacultyController } from '../controllers/FacultyController';
import { GlobalMiddleware } from '../middlewares/GlobalMiddleware';
import { FacultyValidator } from '../validators/FacultyValidator';


class FacultyRouter {
    public router: Router;

    constructor() {
        this.router = Router();

        this.postroutes();
        this.getroutes();
        this.deleteroutes();
        this.patchroutes();
    }

    //post Routes
    postroutes() {
        this.router.post("/create-faculty",
            // FacultyValidator.createFaculty(),
            // GlobalMiddleware.checkError,
            FacultyController.createFaculty
        )
    }

    //get Routes
    getroutes() {
        this.router.get("/get-faculty",
            FacultyController.getFaculty
        )
    }

    //delete Routes
    deleteroutes() {
        this.router.delete("/delete-faculty",
            FacultyController.deleteFaculty
        )
    }

    //patch Routes
    patchroutes() {
        this.router.patch("/update-faculty",
            FacultyController.updateFaculty
        )
    }
}

export default new FacultyRouter().router;