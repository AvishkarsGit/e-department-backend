import { body } from 'express-validator';
import Department from '../models/Department';
import { json } from 'body-parser';

export class DepartmentValidator {
    static createDepartment() {
        return [
            body("name", "name is required")
                .isString()
                .custom((name, { req }) => {
                    return Department.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }).then((dept) => {
                        if (dept) {
                            throw new Error(`${name} is alredy present`);
                        } else {
                            return true;
                        }
                    })
                })
        ]
    }
}