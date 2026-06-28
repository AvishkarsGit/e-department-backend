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
      GlobalMiddleware.checkRole("admin","faculty"),
      PeriodsController.getAllPeriods
    );
  }

  postRoutes() {
    //save period
    this.router.post(
      "/save",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin"),
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
      GlobalMiddleware.checkRole("admin"),
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
      GlobalMiddleware.checkRole("admin"),
      PeriodsController.deletePeriod
    );
  }
}
export default new PeriodsRouter().router;
