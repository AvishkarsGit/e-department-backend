import Faculty from "../models/Faculty";
import Department from "../models/Department";
import Class from "../models/Class";
import { JWT } from "../utils/JWT";
import User from "../models/User";
import Subject from "../models/Subject";
import { lookup } from "dns";



export class FacultyController {

    //creating the faculty
    static async createFaculty(req, res, next) {
        try {
            const { name, email, username, password, phone, department_name, subjects, year, semester } = req.body;

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "Username already taken" });
            }

            const hashPass = await JWT.encryptPassword(password);

            const user = await new User({
                name,
                email,
                username,
                password: hashPass,
                phone,
                role: "faculty"
            }).save();

            const departement = await new Department({
                name: department_name
            }).save();

            if (!user) {
                throw new Error(
                    "Fail to create the user"
                );
            }

            const subject = await new Subject({
                name: subjects,
            }).save();

            if (!subject) {
                throw new Error(
                    "Fail to load the Subjects"
                )
            }

            const assigned_class = await new Class({
                year: year,
                semester: semester
            }).save();

            if (!assigned_class) {
                throw new Error(
                    "Fail to load assign class"
                )
            }

            const faculty = await new Faculty({
                user_id: user._id,
                department_id: departement._id,
                subjects: [subject._id],
                assigned_class: assigned_class._id
            }).save();

            if (!faculty) {
                throw new Error(
                    "Fail to load the faculty"
                )
            }

            res.json({
                success: true,
                data: { user, departement, faculty, assigned_class, subject }
            })

        } catch (error) {
            next(error);
        }
    }

    //read the faculty
    static async getFaculty(req, res, next) {
        try {
            const per_page = parseInt(req.query.size) || 5;
            const current_page = parseInt(req.query.page) || 1;
            const skip = (current_page - 1) * per_page;

            const filter = req.query.filter || "";
            const regex = filter ? new RegExp(filter, "i") : null;

            // Filter by student name, email, or username
            const matchStage = regex
                ? { $or: [{ name: regex }, { email: regex }, { username: regex }] }
                : {};

            const pipeline = [
                { $match: matchStage },
                //join the user
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },

                //join the department
                {
                    $lookup: {
                        from: "departments",
                        localField: "department_id",
                        foreignField: "_id",
                        as: "department"
                    }
                },
                { $unwind: "$department" },

                {
                    $lookup: {
                        from: "subjects",
                        localField: "subjects",
                        foreignField: "_id",
                        as: "subjects"
                    }
                },
                { $unwind: { path: "$subjects", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "classes",
                        localField: "assigned_class",
                        foreignField: "_id",
                        as: "assignedclass"
                    }
                },
                { $unwind: { path: "$assignedclass", preserveNullAndEmptyArrays: true } },

                //facet For pagination
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [{ $skip: skip }, { $limit: per_page }],
                    },
                },
            ];

            const result = await Faculty.aggregate(pipeline);
            const total = result[0].metadata[0]?.total || 0;
            const faculties = result[0].data;


            return res.json({
                success: true,
                data: faculties,

                pagination: {
                    total,
                    per_page,
                    current_page,
                    total_pages: Math.ceil(total / per_page),
                },

            })


        } catch (error) {
            throw error;
        }
    }

    //Update Faculty
    static async updateFaculty(req, res, next) {
        try {
            const { name, email, username, phone, department_name, subjects, year, semester, assigned_class } = req.body;

            const user_id = req.params.user_id || req.query.user_id;
            const id = req.params.id || req.query.id;
            const department_id = req.params.department_id || req.query.department_id;
            const subject = req.params.subjects._id || req.query.subjects._id;

            if (!user_id) throw new Error("user_id Not available");
            if (!id) throw new Error("Id not available");
            if (!department_id) throw new Error("Department id not available");

            const password = req.body.password;

            let hashedPassword;
            if (password) {
                hashedPassword = await JWT.encryptPassword(password);
            }

            const data = {
                name,
                email,
                username,
                phone,
                department_name,
                subjects,
                year,
                semester
            }

            let finalData = hashedPassword
                ? { ...data, password: hashedPassword }
                : data;

            console.log("finalData:", finalData);

            //when the cloudinary file merge here
            // const updatedData = photo ? { ...finalData, photo } : finalData;

            const updatedData = { ...finalData };

            const user = await User.findOneAndUpdate(
                {
                    _id: user_id
                },
                {
                    $set: { ...updatedData }
                },
                {
                    new: true
                }
            )
            if (!user) throw new Error("User is not found");

            const department = await Department.findOneAndUpdate(
                {
                    _id: department_id
                },
                {
                    $set: {
                        $set: { ...updatedData }
                    }
                },
                {
                    new: true, upsert: true
                }
            )

            if (!department) throw new Error("Department is not found");

            const Subjects = await Subject.findByIdAndUpdate(
                {
                    _id: subjects
                },
                {
                    $set: {
                        $set: { ...updatedData }
                    }
                },
                {
                    new: true, upsert: true
                }

            )
            if (!Subjects) throw new Error("Subject is not found");

            const Assigned_class = await Class.findByIdAndUpdate(
                {
                    _id: assigned_class
                },
                {
                    $set: {
                        $set: { ...updatedData }
                    }
                },
                {
                    new: true, upsert: true
                }
            )

            if (!Assigned_class) throw new Error("Assigned class not found");

            const faculty = await Faculty.findOneAndUpdate(
                {
                    _id: id
                },
                {
                    user_id: user._id,
                    department_id: department._id,
                    subjects_id: subjects._id,
                    assigned_class_id: assigned_class._id
                },
                {
                    new: true,

                }
            )

            if (!faculty) throw new Error("Faculty is not found");

            return res.json({
                success: true,
                data: { user, Assigned_class, department, Subject, faculty }
            })

        } catch (error) {
            throw error;
        }
    }


    //delete faculty
    static async deleteFaculty(req, res, next) {
        try {
            //get id from params
            const user_id = req.query.user_id || req.params.user_id;
            const id = req.query.id || req.params.id;
            //check available
            if (!id) throw new Error("Id not available");
            if (!user_id) throw new Error("user_id is not available");

            //delete frist User
            const deletedUser = await User.findOneAndDelete({ _id: user_id });
            if (!deletedUser) throw new Error("User is not found");

            //delete Faculty data
            const deletedFaculty = await Faculty.findByIdAndDelete({ _id: id });
            if (!deletedFaculty) throw new Error("Faculty is not found");

            return res.json({
                success: true
            })
        } catch (error) {
            throw error
        }
    }

}

