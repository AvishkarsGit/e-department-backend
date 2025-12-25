import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { UserValidator } from "../validators/UserValidator";
import { UserController } from "../controllers/UserController";
import { Utils } from "../utils/Utils";

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

    //check if user is exist or not
    this.router.get("/exists", UserController.checkUserExists);

    //get users with pagination
    this.router.get(
      "/users",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin"),
      UserController.getUsers
    );

    //get all users
    this.router.get(
      "/allUsers",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin"),
      UserController.getAllUsers
    );

    //check if admin is exists or not
    this.router.get("/checkAdminExists", UserController.checkAdminExists);
  }

  postRoutes() {
    // signup
    this.router.post(
      "/signup",
      new Utils().multer.single("photo"), //upload photo
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
      GlobalMiddleware.checkRole("admin"),
      new Utils().multer.single("photo"),
      UserValidator.addUser(),
      GlobalMiddleware.checkError,
      UserController.addUser
    );

    //update profile data
    this.router.post(
      "/update_profile",
      GlobalMiddleware.auth,
      new Utils().multer.single("photo"),
      UserValidator.updateProfile(),
      GlobalMiddleware.checkError,
      UserController.updateProfile
    );
    //accept user
    this.router.post(
      "/accept-user",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin"),
      UserController.acceptUser
    );
  }

  putRoutes() {}

  patchRoutes() {
    //send reset password token
    this.router.patch(
      "/send/reset/password/token",
      UserValidator.sendResetPasswordToken(),
      GlobalMiddleware.checkError,
      UserController.sendResendPasswordToken
    );

    //send verification token email again
    this.router.patch(
      "/send/verification/token",
      UserController.sendVerificationToken
    );

    //route: verify reset password token
    this.router.patch(
      "/verifyOtp",
      UserValidator.verifyResetPasswordOtp(),
      GlobalMiddleware.checkError,
      UserController.verifyResetPasswordOtp
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

    //update users data
    this.router.patch(
      "/update/:id",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin"),
      new Utils().multer.single("photo"), //upload photo
      UserValidator.updateUser(),
      GlobalMiddleware.checkError,
      UserController.updateUser
    );
  }

  deleteRoutes() {
    this.router.delete(
      "/delete/:id",
      GlobalMiddleware.auth,
      GlobalMiddleware.checkRole("admin"),
      UserController.deleteUser
    );
  }
}

export default new UserRouter().router;
