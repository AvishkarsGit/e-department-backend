import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { DashboardController } from "../controllers/DashboardController";

class DashboardRouter {
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
    //get boxes data
    this.router.get(
      "/boxes",
      GlobalMiddleware.auth,
      DashboardController.getBoxesData
    );
  }
  postRoutes() {}
  putRoutes() {}
  patchRoutes() {}
  deleteRoutes() {}
}
export default new DashboardRouter().router;
