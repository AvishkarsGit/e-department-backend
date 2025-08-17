import { body, query } from "express-validator";
import User from "../models/User";

export class UserValidators {
  static signup() {
    return [
      body("name", "Name is required").isString(),
      body("email", "Email is required").isEmail(),
      body("username", "Username is required").isString(),
      body("password", "Password is required")
        .isAlphanumeric()
        .isLength({ min: 8, max: 15 })
        .withMessage("Password must be in between 8 - 15 characters"),
      body("profilePhoto", "Profile url must be required").isString(),
      body("phone", "Phone number is required")
        .isLength({ max: 10 })
        .withMessage("Phone number is invalid"),
      body("department", "Department is required").isString(),
      body("year", "Please provide your year").isNumeric(),
      body("semester", "Please choose semester ").isNumeric(),
      body("guardianPhone", "Guardians/Parents Phone number is required")
        .isLength({ max: 10 })
        .withMessage("Guardians phone number is invalid"),
    ];
  }

  static verifyUserEmail() {
    return [
      body(
        "verification_token",
        "Email verification token is required"
      ).isString(),
      body("email", "Email is required").isEmail(),
    ];
  }

  static verifyResendFunctionality() {
    return [body("email", "Email is required").isEmail()];
  }

  static login() {
    return [
      query("email", "Email is required")
        .isEmail()
        .custom((email, { req }) => {
          return User.findOne({ email: email }).then((user) => {
            if (user) {
              req.user = user;
              return true;
            } else {
              throw new Error("User doesn't exists");
            }
          });
        }),
      query("password", "Password is required").isString(),
    ];
  }

  static verifyResetPassword() {
    return [
      query("email", "Email is required")
        .isEmail()
        .custom((email, { req }) => {
          return User.findOne({ email }).then((user) => {
            if (user) {
              return true;
            } else {
              throw "No user with such a email";
            }
          });
        }),
    ];
  }

  static validateResetPassword() {
    return [
      query("email", "Email is required").isEmail(),
      query(
        "reset_password_verification_token",
        "Reset password token is required"
      )
        .isString()
        .custom((reset_password_token, { req }) => {
          return User.findOne({
            email: req.query.email,
            reset_password_verification_token: reset_password_token,
            reset_password_verification_token_time: { $gt: Date.now() },
          })
            .then((user) => {
              if (user) {
                return true;
              } else {
                throw "Reset password token doesn't exist. Please regenerate a new token.";
              }
            })
            .catch((e) => {
              throw new Error(e);
            });
        }),
    ];
  }

  static resetPassword() {
    return [
      body("email", "Email is required")
        .isEmail()
        .custom((email, { req }) => {
          return User.findOne({
            email: email,
          })
            .then((user) => {
              if (user) {
                req.user = user;
                return true;
              } else {
                // throw new Error('No User Registered with such Email');
                throw "No User Registered with such Email";
              }
            })
            .catch((e) => {
              throw new Error(e);
            });
        }),
      body("new_password", "New Password is required").isAlphanumeric(),
      body(
        "reset_password_verification_token",
        "Reset password token is required"
      )
        .isNumeric()
        .custom((reset_password_token, { req }) => {
          if (
            req.user.reset_password_verification_token == reset_password_token
          ) {
            return true;
          } else {
            req.errorStatus = 422;
            // throw new Error('Reset password token is invalid, please try again');
            throw "Reset password token is invalid, please try again";
          }
        }),
    ];
  }

  static verifyUpdateProfile() {
    return [
      body("name", "Name is required").isString(),
      body("phone", "Phone Number is required").isString(),
    ];
  }

  static validateRefreshToken() {
    return [
      body("refreshToken", "Please provide refresh token")
        .isString()
        .custom((refreshToken, { req }) => {
          if (refreshToken) {
            return true;
          } else {
            req.errorStatus = 403;
            // throw new Error('Access is forbidden');
            throw "Access is forbidden";
          }
        }),
    ];
  }
}
