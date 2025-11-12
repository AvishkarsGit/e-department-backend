import { body, query } from "express-validator";
import mongoose from "mongoose";

export class StudyMaterialValidator {
    static addStudyMaterial() {
        return [
            body("attachment").custom((value, { req }) => {
                if (!req.file) {
                    throw new Error("Attachment is required");
                }
                return true;
            }),
            body("title")
                .trim()
                .isLength({ min: 3, max: 200 })
                .withMessage("Title must be 3-200 characters"),
            body("attachment_type")
                .isIn(['lab_manual', 'assignment', 'notice', 'timetable', 'notes', 'syllabus', 'other'])
                .withMessage("Invalid attachment type"),
            body("subject_id")
                .isMongoId()
                .withMessage("Invalid subject ID"),
            body("class_id")
                .isMongoId()
                .withMessage("Invalid class ID"),
            body("faculty_id")
                .isMongoId()
                .withMessage("Invalid faculty ID")
        ];
    }

    static updateStudyMaterial() {
        return [
            body("title")
                .optional()
                .trim()
                .isLength({ min: 3, max: 200 })
                .withMessage("Title must be 3-200 characters"),
            body("attachment_type")
                .optional()
                .isIn(['lab_manual', 'assignment', 'notice', 'timetable', 'notes', 'syllabus', 'other'])
                .withMessage("Invalid attachment type"),
            body("subject_id")
                .optional()
                .isMongoId()
                .withMessage("Invalid subject ID"),
            body("class_id")
                .optional()
                .isMongoId()
                .withMessage("Invalid class ID"),
            body("faculty_id")
                .optional()
                .isMongoId()
                .withMessage("Invalid faculty ID")
        ];
    }

    static getStudyMaterial() {
        return [
            query("class_id")
                .optional()
                .isMongoId()
                .withMessage("Invalid class ID"),
            query("subject_id")
                .optional()
                .isMongoId()
                .withMessage("Invalid subject ID"),
            query("attachment_type")
                .optional()
                .isIn(['lab_manual', 'assignment', 'notice', 'timetable', 'notes', 'syllabus', 'other'])
                .withMessage("Invalid attachment type"),
            query("page")
                .optional()
                .isInt({ min: 1 })
                .withMessage("Page must be a positive integer"),
            query("size")
                .optional()
                .isInt({ min: 1, max: 100 })
                .withMessage("Size must be between 1 and 100")
        ];
    }
}