import { body } from "express-validator";

export class ClassValidator {
  static addClass() {
    return [
      body("department_id", "Department is required").isString(),
      body("year", "Year is required").isNumeric(),
      body("semester", "Semester is required").isNumeric(),
    ];
  }

  static updateClass() {
    return [
      body("department_id", "Department is required").isString(),
      body("year", "Year is required").isNumeric(),
      body("semester", "Semester is required").isNumeric(),
    ];
  }
}
