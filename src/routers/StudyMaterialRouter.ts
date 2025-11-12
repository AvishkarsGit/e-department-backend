import { Router } from "express";
import { StudyMaterialController } from "../controllers/StudyMaterialController";
import { UtilsOfStudy } from "../utils/Utils";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { StudyMaterialValidator } from "../validators/StudyMaterialValidator";

const studyUpload = new UtilsOfStudy();

class StudyMaterialRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET routes
    this.router.get(
      '/materials',
      StudyMaterialValidator.getStudyMaterial(),
      GlobalMiddleware.checkError,
      StudyMaterialController.getStudyMaterial
    );

    this.router.get(
      '/materials/type/:attachment_type',
      StudyMaterialController.getByType
    );

    // POST routes
    this.router.post(
      '/materials',
      studyUpload.multer.single("attachment"),
      StudyMaterialValidator.addStudyMaterial(),
      GlobalMiddleware.checkError,
      StudyMaterialController.createStudyMaterial
    );

    // PATCH routes
    this.router.patch(
      '/materials/:id',
      studyUpload.multer.single("attachment"),
      StudyMaterialValidator.updateStudyMaterial(),
      GlobalMiddleware.checkError,
      StudyMaterialController.updateStudyMaterial
    );

    // DELETE routes
    this.router.delete(
      '/materials/:id',
      StudyMaterialController.deleteStudyMaterial
    );
  }
}

export default new StudyMaterialRouter().router;

