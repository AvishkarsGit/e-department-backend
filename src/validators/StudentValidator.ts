import { body } from "express-validator";
import User from "../models/User";
import Student from "../models/Student";

export class StudentValidator {
  static addStudent() {
    return [
      body("photo").custom((value, { req }) => {
        if (!req.file) {
          throw new Error("Photo is required");
        } else {
          return true;
        }
      }),
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
      body("username", "Username is required").isString(),
      body("password", "Password is required").isString(),
      body("phone", "Phone is required").isString(),
      body("class_id", "Class should be there").isString(),
      body("rollNo", "Roll number is mandatory")
        .isNumeric()
        .custom((rollNo, { req }) => {
          return Student.findOne({ rollNo, class_id: req.body.class_id }).then(
            (student) => {
              if (student) {
                throw new Error("This roll no is already taken by other");
              } else {
                return true;
              }
            }
          );
        }),
      // ✅ guardian validation as array
      body("guardian", "Guardian details required")
        .isJSON()
        .withMessage("At least one guardian is required"),
    ];
  }

  static updateStudent() {
    return [
      body("name", "Name is required").isString(),
      body("email", "Email is required").isEmail(),
      body("username", "Username is required").isString(),
      body("phone", "Phone is required").isString(),
      body("class_id", "Class should be there").isString(),
      body("rollNo", "Roll number is mandatory")
        .isNumeric()
        .custom((rollNo, { req }) => {
          return Student.findOne({ rollNo, class_id: req.body.class_id }).then(
            (student) => {
              if (student) {
                throw new Error("This roll no is already taken by other");
              } else {
                return true;
              }
            }
          );
        }),
      // ✅ guardian validation as array
      body("guardian", "Guardian details required")
        .isJSON()
        .withMessage("At least one guardian is required"),
    ];
  }
}
