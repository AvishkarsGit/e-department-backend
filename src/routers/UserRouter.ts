import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { UserValidator } from "../validators/UserValidator";
import { UserController } from "../controllers/UserController";

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

    //get all users with pagination
    this.router.get(
      "/users",
      GlobalMiddleware.auth,
      UserController.getAllUsers
    );

    //check if admin is exists or not
    this.router.get("/checkAdminExists", UserController.checkAdminExists);
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

    //add user
    this.router.post(
      "/add",
      GlobalMiddleware.auth,
      UserValidator.addUser(),
      GlobalMiddleware.checkError.apply,
      UserController.addUser
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

  deleteRoutes() {
    this.router.delete("/delete-faculty/:id", UserController.deleteFaculty);
  }
}

export default new UserRouter().router;
