import { body } from "express-validator";

export class StudyMaterialValidator {
    static addStudyMaterial() {
        return [
            body("attachment").custom((value, { req }) => {
                if (!req.file) {
                    throw new Error("Attechment is required");
                } else {
                    return true;
                }
            }),
            body("title", "title is required").isString(),
            body("subject _id", "subject is required").isString(),
            body("class_id", "class is required").isString(),
            body("faculty_id", "faculty is required").isString(),

        ]
    }
    static updateStudyMaterial() {
        return [
            body("attachment").custom((value, { req }) => {
                if (!req.file) {
                    throw new Error("Attechment is required");
                } else {
                    return true;
                }
            }),
            body("title", "title is required").isString(),
            body("subject _id", "subject is required").isString(),
            body("class_id", "class is required").isString(),
            body("faculty_id", "faculty is required").isString(),
        ]
    }
}