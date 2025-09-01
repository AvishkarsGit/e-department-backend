import { body, query } from "express-validator";
import User from "../models/User";


export class UserValidator {
  static signup() {
    return [
      body("name", "Name is required").isString(),
      body("email", "Email is required")
        .isEmail()
        .custom((email, { req }) => {
          return User.findOne({ email }).then((user) => {
            if (user) {
              throw new Error("User is already exist with this email");
            } else {
              return true;
            }
          });
        }),
      body("username", "Username is required")
        .isString()
        .isLength({ min: 5, max: 15 })
        .withMessage("Username should be at least 5 to 15 character")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("username contains only underscore, numbers or letters")
        .matches(/[a-zA-Z]/)
        .withMessage("username must be at least one alphabet")
        .custom((username, { req }) => {
          if (username === req.body.name) {
            throw new Error("Username cannot be same as name");
          } else {
            return User.findOne({ username }).then((user) => {
              if (user) {
                throw new Error("Username is already taken by the another");
              } else {
                return true;
              }
            });
          }
        }),
      body("password", "Password is required")
        .isString()
        .isLength({ min: 8, max: 15 })
        .withMessage("Password must be in between 8 - 15 characters"),
      body("phone", "Phone number is required")
        .isString()
        .isLength({ min: 10, max: 10 })
        .withMessage("Phone number should be 10 digit"),

      body("photo", "Profile url is needed").isString(),
      body("role", "user role is important").isString(),
    ];
  }

  static verifyEmail() {
    return [body("otp", "please enter otp").isString()];
  }

  static login() {
    return [
      body("email", "Username is required")
        .isString()
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
      body("password", "Password is required").isString(),
    ];
  }

  static sendResetPasswordToken() {
    return [
      query("email", "Email is required")
        .isEmail()
        .custom((email, { req }) => {
          return User.findOne({ email }).then((user) => {
            if (user) {
              req.user = user;
              return true;
            } else {
              return false;
            }
          });
        }),
    ];
  }

  static resetPassword() {
    return [
      body("otp", "Please enter otp").isString(),
      body("new_password", "Please enter new password"),
    ];
  }

  static refreshToken() {
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

  static addUser() {
    return [
      body("name", "Name is required").isString(),
      body("email", "Email is required")
        .isEmail()
        .custom((email, { req }) => {
          return User.findOne({ email }).then((user) => {
            if (user) {
              throw new Error("User already exists with this email");
            } else {
              return true;
            }
          });
        }),
      body("phone", "Phone number is required").isString(),
      body("role", "Role is required").isString(),
      body("password", "Password is required").isString(),
    ];
  }

  static updateUser() {
    return [
      body("name", "Name is required").isString(),
      body("email", "Email is required").isString(),
      body("phone", "Phone number is required").isString(),
      body("role", "Role is required").isString(),
    ];
  }
}
