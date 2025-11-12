import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { SubjectValidator } from "../validators/SubjectValidator";
import { SubjectController } from "../controllers/SubjectController";

class SubjectRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.patchRoutes();
    this.deleteRoutes();
    this.putRoutes();
  }

  getRoutes() {
    //get all subjects

    this.router.get(
      "/subjects",
      GlobalMiddleware.auth,
      SubjectController.getAllSubjects
    );

    //get all subjects without pagination
    this.router.get(
      '/allSubjects',
      GlobalMiddleware.auth,
      SubjectController.getAllSubjectsWithoutPagination
    )

    //get particular subject details
    this.router.get(
      "/get-subject",
      GlobalMiddleware.auth,
      SubjectController.getSubject
    );
    this.router.get(
      "/fetchClassId",
      // GlobalMiddleware.auth,
      SubjectValidator.fetchClassId(),
      GlobalMiddleware.checkError,
      SubjectController.fetchClassId
    );
  }
  postRoutes() {
    //add subject
    this.router.post(
      "/add",
      SubjectValidator.addSubject(),
      GlobalMiddleware.checkError,
      SubjectController.addSubject
    );
  }
  patchRoutes() {
    //update subject
    this.router.patch(
      "/update/:id",
      // GlobalMiddleware.auth,
      SubjectValidator.updateSubject(),
      GlobalMiddleware.checkError,
      SubjectController.updateSubject
    );
  }
  deleteRoutes() {
    //delete subject
    this.router.delete(
      "/delete/:id",
      //  GlobalMiddleware.auth,
      SubjectController.deleteSubject
    );
  }
  putRoutes() {}
}

export default new SubjectRouter().router;
