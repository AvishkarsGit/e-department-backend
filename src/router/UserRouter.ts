import { Router } from "express";
import { GlobalMiddleware } from "../middleware/GlobalMiddleware";
import { UserValidator } from "../validator/UserValidator";
import { UserController } from "../controller/UserController";

class UserRouter {
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
    this.router.get("/profile", GlobalMiddleware.auth, UserController.profile);

    //send reset password token
    this.router.get(
      "/send/reset/password/token",
      UserValidator.sendResetPasswordToken(),
      GlobalMiddleware.checkError,
      UserController.sendResendPasswordToken
    );
  }

  postRoutes() {
    // signup
    this.router.post(
      "/signup",
      UserValidator.signup(),
      GlobalMiddleware.checkError,
      UserController.signup
    );

    // login
    this.router.post(
      "/login",
      UserValidator.login(),
      GlobalMiddleware.checkError,
      UserController.login
    );

    //refresh access Token
    this.router.post(
      "/refresh-token",
      UserValidator.refreshToken(),
      GlobalMiddleware.checkError,
      UserController.refreshToken
    );

    //create faculty
    this.router.post(
      "/create-faculty",
      GlobalMiddleware.auth,
      UserValidator.createFaculty(),
      GlobalMiddleware.checkError,
      UserController.createFaculty
    );

    //department
    this.router.post(
      "/add-department",
      UserValidator.addDepartment(),
      GlobalMiddleware.checkError,
      UserController.addDepartment
    );
  }

  putRoutes() {}

  patchRoutes() {
    //send verification token email again
    this.router.patch(
      "/send/verification/token",
      GlobalMiddleware.auth,
      UserController.sendVerificationToken
    );

    //verify email

    this.router.patch(
      "/verify-email",
      GlobalMiddleware.auth,
      UserValidator.verifyEmail(),
      GlobalMiddleware.checkError,
      UserController.verifyEmail
    );

    //reset password
    this.router.patch(
      "/reset/password",
      UserValidator.resetPassword(),
      GlobalMiddleware.checkError,
      UserController.resetPassword
    );
  }

  deleteRoutes() {}
}

export default new UserRouter().router;
