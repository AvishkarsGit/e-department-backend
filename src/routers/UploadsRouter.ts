import { Router } from "express";
import { UploadsController } from "../controllers/UploadsController";
import { UploadsValidator } from "../validators/UploadsValidator";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { Utils } from "../utils/Utils";

class UploadsRouter {
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
    // get all study material with pagination
    this.router.get(
      "/getAllMaterial",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "student", "faculty"),
      UploadsController.getAllMaterial
    );

    //download file
    this.router.get(
      "/download/:id",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "student", "faculty"),
      UploadsController.downloadFile
    );
  }

  postRoutes() {
    //upload material
    this.router.post(
      "/upload",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      new Utils().multer.single("uploaded_url"),
      UploadsValidator.uploadMaterial(),
      GlobalMiddleware.checkError,
      UploadsController.uploadMaterial
    );
  }

  putRoutes() {}

  patchRoutes() {
    //update material
    this.router.patch(
      "/update/:id",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      new Utils().multer.single("uploaded_url"),
      UploadsValidator.updateMaterial(),
      GlobalMiddleware.checkError,
      UploadsController.updateMaterial
    );
  }

  deleteRoutes() {
    //delete material
    this.router.delete(
      "/delete/:id",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin", "faculty"),
      UploadsController.deleteMaterial
    );
  }
}

export default new UploadsRouter().router;
