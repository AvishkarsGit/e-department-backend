import { body } from "express-validator";
import User from "../models/User";

export class FacultyValidator {
    static addFaculty() {
        return [
            body("photo").custom((value, { req }) => {
                if (!req.file) {
                    throw new Error("Photo is required");
                } else {
                    return true;
                }
            }),
            body("name", "name is required").isString(),
            body("email", "email is required").isString()
                .custom((email, { req }) => {
                    return User.findOne({ email }).then((user) => {
                        if (user) {
                            throw new Error("User already exists with this email");
                        } else {
                            return true;
                        }
                    });
                }),
            body("username", "Username is required").isString()
                .custom((username, { req }) => {
                    return User.findOne({ username }).then((user) => {
                        if (user) {
                            throw new Error("username alredy taken");
                        } else {
                            return true;
                        }
                    })
                }),
                
            body("password", "Password is required").isString(),
            body("phone", "Phone is required").isString(),
            body("department_id", "department is required").isString(),


        ]
    }

    static updateFaculty() {
        return [
            body("name", "Name is required").isString(),
            body("email", "Email is required").isEmail(),
            body("username", "Username is required").isString(),
            body("phone", "Phone is required").isString(),
            body("password", "Password is required").isString(),
            body("department_id", "department is required").isString()
        ]
    }
}