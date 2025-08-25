import { Router } from "express";
import { FacultyValidator } from "../validator/FacultyValidator";
import { GlobalMiddleware } from "../middleware/GlobalMiddleware";
import { FacultyController } from "../controller/FacultyController";

class FacultyRouter {
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
    //get profile
    this.router.get(
      "/profile",
      GlobalMiddleware.auth,
      FacultyController.profile
    );
  }

  postRoutes() {
    //login
    this.router.post(
      "/login",
      FacultyValidator.login(),
      GlobalMiddleware.checkError,
      FacultyController.login
    );
  }

  putRoutes() {}

  patchRoutes() {
    this.router.patch(
      "/update/profile",
      GlobalMiddleware.auth,
      FacultyValidator.updateProfile(),
      GlobalMiddleware.checkError,
      FacultyController.updateProfile
    );

    //send verification token

    this.router.patch(
      "/send/verification/token",
      GlobalMiddleware.auth,
      FacultyController.sendVerificationToken
    );

    //verify email
    this.router.patch(
      "/verify/email",
      GlobalMiddleware.auth,
      FacultyValidator.verifyEmail(),
      GlobalMiddleware.checkError,
      FacultyController.verifyEmail
    );

    //send reset password token
    this.router.patch(
      "/send/reset/password/token",
      FacultyValidator.sendResetPasswordToken(),
      GlobalMiddleware.checkError,
      FacultyController.sendResetPasswordToken
    );

    //update password
    this.router.patch(
      "/reset/password",
      FacultyValidator.resetPassword(),
      GlobalMiddleware.checkError,
      FacultyController.resetPassword
    );
  }

  deleteRoutes() {}
}

export default new FacultyRouter().router;
