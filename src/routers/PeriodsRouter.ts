import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { PeriodsValidator } from "../validators/PeriodsValidator";
import { PeriodsController } from "../controllers/PeriodsController";

class PeriodsRouter {
  public router: Router;
  constructor() {
    this.router = Router();

    //routes
    this.getRoutes();
    this.postRoutes();
    this.putRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
    //get all periods
    this.router.get(
      "/periods",
      GlobalMiddleware.auth,
      PeriodsController.getAllPeriods
    );
  }

  postRoutes() {
    //save period
    this.router.post(
      "/save",
      GlobalMiddleware.auth,
      PeriodsValidator.savePeriod(),
      GlobalMiddleware.checkError,
      PeriodsController.savePeriod
    );
  }
  putRoutes() {}
  patchRoutes() {
    //update the period
    this.router.patch(
      "/update/:id",
      GlobalMiddleware.auth,
      PeriodsValidator.updatePeriod(),
      GlobalMiddleware.checkError,
      PeriodsController.updatePeriod
    );
  }

  deleteRoutes() {
    //delete period
    this.router.delete(
      "/delete/:id",
      GlobalMiddleware.auth,
      PeriodsController.deletePeriod
    );
  }
}
export default new PeriodsRouter().router;
