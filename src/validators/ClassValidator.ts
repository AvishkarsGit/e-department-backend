import { body } from "express-validator";
import Class from "../models/Class";

export class ClassValidator {
  static addClass() {
    return [
      body("department_id", "Department is required").isString(),
      body("year", "Year is required").isNumeric(),
      body("semester", "Semester is required")
        .isNumeric()
        .custom((semester, { req }) => {
          return Class.findOne({
            department_id: req.body.department_id,
            year: req.body.year,
            semester,
          }).then((classData) => {
            if (classData) {
              throw new Error(
                "this department information is already exist!.."
              );
            } else {
              return true;
            }
          });
        }),
    ];
  }

  static updateClass() {
    return [
      body("department_id", "Department is required").isString(),
      body("year", "Year is required").isNumeric(),
      body("semester", "Semester is required")
        .isNumeric()
        .custom((semester, { req }) => {
          return Class.findOne({
            department_id: req.body.department_id,
            year: req.body.year,
            semester,
          }).then((classData) => {
            if (classData) {
              throw new Error(
                "You can't update, this department information is already exist!.."
              );
            } else {
              return true;
            }
          });
        }),
    ];
  }
}
