import { body, query } from "express-validator";
import mongoose from "mongoose";
import Subject from "../models/Subject";
import Class from "../models/Class";

export class SubjectValidator {
  static addSubject() {
    return [
      body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Subject name must be 2-100 characters")
        .matches(/^[a-zA-Z0-9\s&.-]+$/)
        .withMessage("Subject name contains invalid characters"),
      body("code")
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage("Subject code must be 2-20 characters")
        .matches(/^[A-Z0-9-]+$/)
        .withMessage(
          "Subject code must be uppercase letters, numbers, and hyphens only"
        ),

      body("class_id")
        .isMongoId()
        .withMessage("Invalid class ID format")
        .custom(async (classId, { req }) => {
          // Validate class exists
          const classExists = await Class.findById(classId).lean();
          if (!classExists) {
            throw new Error("Class not found");
          }

          // Check for duplicate subject
          const existingSubject = await Subject.findOne({
            class_id: new mongoose.Types.ObjectId(classId),
            $or: [
              { name: req.body.name.trim() },
              { code: req.body.code.trim().toUpperCase() },
            ],
          }).lean();

          if (existingSubject) {
            throw new Error(
              "Subject with this name and code already exists in this class"
            );
          }
          return true;
        }),
    ];
  }

  static updateSubject() {
    return [
      body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Subject name must be 2-100 characters")
        .matches(/^[a-zA-Z0-9\s&.-]+$/)
        .withMessage("Subject name contains invalid characters"),
      body("code")
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage("Subject code must be 2-20 characters")
        .matches(/^[A-Z0-9-]+$/)
        .withMessage(
          "Subject code must be uppercase letters, numbers, and hyphens only"
        ),

      body("class_id")
        .isMongoId()
        .withMessage("Invalid class ID format")
        .custom(async (classId, { req }) => {
          // Validate class exists
          const classExists = await Class.findById(classId).lean();
          if (!classExists) {
            throw new Error("Class not found");
          }

          const existingSubject = await Subject.findOne({
            class_id: new mongoose.Types.ObjectId(classId),
            $or: [
              { name: req.body.name.trim() },
            ],
          }).lean();

          if (existingSubject) {
            throw new Error(
              "Subject with this name and code already exists in this class"
            );
          }
          return true;
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
              throw new Error("Class not found");
            }
          });
        }),
    ];
  }

  static getSubject() {
    return [
      query("id", "Subject ID is required")
        .isMongoId()
        .withMessage("Invalid subject ID format")
        .custom(async (id) => {
          const subject = await Subject.findById(id).lean();
          if (!subject) {
            throw new Error("Subject not found");
          }
          return true;
        }),
    ];
  }
}
