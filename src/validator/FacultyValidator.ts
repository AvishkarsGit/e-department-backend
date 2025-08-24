import { body } from "express-validator";
import User from "../model/User";

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
}
