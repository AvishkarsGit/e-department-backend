import { Router } from "express"
import { SeederController } from "../controllers/SeederController";

class SeederRouter {
    public router: Router;
    constructor() {
        this.router = Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.putRoutes();
    }

    getRoutes() {

    }
    postRoutes() {
        // seed users info along with student and faculties
        this.router.post('/seed-info', SeederController.seedUsers);

    }
    patchRoutes() {

    }
    putRoutes() {

    }
}

export default new SeederRouter().router;