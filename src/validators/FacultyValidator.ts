import { body } from "express-validator";
import User from "../models/User";
import Department from "../models/Department";
import Class from "../models/Class";
import Subject from "../models/Subject";

export class FacultyValidator {
    static createFaculty() {
        return [
            body("user_id", "user id is required")
                .isString()
                .custom((user_id, { req }) => {
                    return User.findById(user_id)
                        .then((id) => {
                            if (id) {
                                return true;
                            } else {
                                throw new Error("user is not exists");
                            }
                        })
                }),

            body("department_id", "Department is Required")
                .isString()
                .custom((department_id, { req }) => {
                    return Department.findById(department_id)
                        .then((id) => {
                            if (id) {
                                return true;
                            } else {
                                throw new Error("Department is not exists");
                            }
                        })
                }),

            body("assigned_class", "assigned Classes is required")
                .isString()
                .custom((assigned_class, { req }) => {
                    return Class.findById(assigned_class)
                        .then((id) => {
                            if (id) {
                                return true;
                            } else {
                                throw new Error("Assigned Classes is not exists in data");
                            }
                        })
                }),

            // body("subjects", "Subjects are required")
            //     .isArray({ min: 1 }) 
            //     .custom(async (subjects) => {
            //         const results = await Promise.all(
            //             subjects.map((id) => Subject.findById(id))
            //         );

            //         const invalid = results.some((s) => !s);
            //         if (invalid) {
            //             throw new Error("One or more subjects do not exist in data");
            //         }
            //         return true;
            //     })


        ]
    }
}