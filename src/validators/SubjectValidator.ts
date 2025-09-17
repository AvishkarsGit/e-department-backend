import { body, query } from "express-validator";
import Subject from "../models/Subject";
import Class from "../models/Class";

export class SubjectValidator {
  static addSubject() {
    return [
      body("name", "Subject name is required").isString(),
      body("code", "Subject code is required").isString(),
      body("class_id", "Class is required")
        .isString()
        .custom((classId, { req }) => {
          return Subject.findOne({
            name: req.body.name,
            code: req.body.code,
            class_id: classId,
          }).then((subject) => {
            if (subject) {
              throw new Error("subject is already present");
            } else {
              return true;
            }
          });
        }),
    ];
  }

  static updateSubject() {
    return [
      body("name", "Subject name is required").isString(),
      body("code", "Subject code is required").isString(),
      body("class_id", "Class is required")
        .isString()
        .custom((classId, { req }) => {
          return Subject.findOne({
            name: req.body.name,
            code: req.body.code,
            class_id: classId,
          }).then((subject) => {
            if (subject) {
              throw new Error("subject is already present");
            } else {
              return true;
            }
          });
        }),
    ];
  }

  static fetchClassId() {
    return [
      query("department_id", "Department id must be present").isString(),
      query("year", "Year is required").isString(),
      query("semester", "Semester is required")
        .isString()
        .custom((semester, { req }) => {
          return Class.findOne({
            department_id: req.query.department_id,
            year: req.query.year,
            semester,
          }).then((c) => {
            if (c) {
              req.classId = c._id;
              return true;
            } else {
              return false;
            }
          });
        }),
    ];
  }
}
