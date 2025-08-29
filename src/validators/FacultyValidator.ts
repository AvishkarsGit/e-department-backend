import { body } from "express-validator";
import User from "../models/User";

export class FacultyValidator {
 

  static login() {
    return [
      body("username", "Username is required")
        .isString()
        .custom((username, { req }) => {
          return User.findOne({ username }).then((user) => {
            if (user) {
              req.user = user;
              return true;
            } else {
              throw new Error("User doesn't exists");
            }
          });
        }),
      body("password", "Password is required").isString(),
    ];
  }

  static updateProfile() {
    return [
      body("name", "Name is required").isString(),
      body("phone", "Phone number is required").isString(),
      body("profile", "Profile photo is needed").isString(),
    ];
  }

  static verifyEmail() {
    return [body("otp", "OTP is required").isString()];
  }

  static sendResetPasswordToken() {
    return [
      body("email", "Email is required")
        .isString()
        .custom((email, { req }) => {
          return User.findOne({ email }).then((user) => {
            if (user) {
              req.user = user;
              return true;
            } else {
              throw new Error("User does not exist with this email");
            }
          });
        }),
    ];
  }

  static resetPassword() {
    return [
      body("otp", "OTP is required")
        .isString()
        .custom((otp, { req }) => {
          return User.findOne({
            reset_password_verification_token: otp,
            reset_password_verification_token_time: { $gt: Date.now() },
          }).then((user) => {
            if (user) {
              req.user = user;
              return true;
            } else {
              throw new Error("entered otp is wrong or expired");
            }
          });
        }),
      body("new_password", "New password is required").isString(),
    ];
  }
}
