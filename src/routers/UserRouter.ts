import { Router } from "express";
import UserController from "../controller/UserController";
import { UserValidators } from "../validator/UserValidator";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";

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
    //route: login

    this.router.get(
      "/login",
      UserValidators.login(),
      GlobalMiddleware.checkError,
      UserController.login
    );

    // route: profile
    this.router.get("/profile", GlobalMiddleware.auth, UserController.profile);

    //route: send reset password token
    this.router.get(
      "/send/reset/password/token",
      UserValidators.verifyResetPassword(),
      GlobalMiddleware.checkError,
      UserController.sendResetPasswordToken
    );
  }

  postRoutes() {
    //route: signup or creating an account
    this.router.post(
      "/signup",
      UserValidators.signup(),
      GlobalMiddleware.checkError,
      UserController.signup
    );

    //route: refresh the access token
    this.router.post(
      "/refresh-token",
      UserValidators.validateRefreshToken(),
      GlobalMiddleware.checkError,
      UserController.refreshTheToken
    );
  }

  putRoutes() {}

  patchRoutes() {
    // route: verifying email
    this.router.patch("/verify", GlobalMiddleware.auth, UserController.verify);

    // route: resend verification email
    this.router.patch(
      "/resend-email",
      UserValidators.verifyResendFunctionality(),
      GlobalMiddleware.checkError,
      GlobalMiddleware.auth,
      UserController.resendVerificationToken
    );

    //route: verify reset password token
    this.router.patch(
      "/verify/reset/password",
      UserValidators.validateResetPassword(),
      GlobalMiddleware.checkError,
      UserController.verifyResetPasswordToken
    );

    //route: reset the password

    this.router.patch(
      "/reset/password",
      UserValidators.resetPassword(),
      GlobalMiddleware.checkError,
      UserController.resetPassword
    );

    //route: update profile data

    this.router.patch(
      "/update/profile",
      GlobalMiddleware.auth,
      UserValidators.verifyUpdateProfile(),
      GlobalMiddleware.checkError,
      UserController.updateProfile
    );
  }

  deleteRoutes() {}
}

export default new UserRouter().router;
