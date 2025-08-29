import { body } from "express-validator";
import Department from "../models/Department";
import User from "../models/User";

export class AdminValidator {
  static createFaculty() {
    return [
      body("name", "faculty name is required").isString(),
      body("email", "faculty email is required")
        .isEmail()
        .custom((email, { req }) => {
          return User.findOne({ email }).then((user) => {
            if (user) {
              throw new Error("User is already exists with this email");
            } else {
              return true;
            }
          });
        }),
    ];
  }

  static addDepartment() {
    return [
      body("name", "department name is required")
        .isString()
        .custom((name, { req }) => {
          return Department.findOne({ name }).then((department) => {
            if (department) {
              throw new Error(`${name} department is already exist`);
            } else {
              return true;
            }
          });
        }),
    ];
  }

  static updateFaculty() {
    return [
      body("name", "Name is required").isString(),
      body("email", "Email is required").isEmail(),
      body("phone", "Phone number is required").isString(),
    ];
  }
}
