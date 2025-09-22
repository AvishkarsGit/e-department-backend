import Student from "../models/Student";
import User from "../models/User";
import { Cloudinary } from "../utils/Cloudinary";
import { JWT } from "../utils/JWT";

export class StudentController {
  static async addStudent(req, res, next) {
    try {
      const {
        name,
        email,
        username,
        password,
        rollNo,
        phone,
        guardian,
        class_id,
      } = req.body;

      let guardian_data = JSON.parse(guardian);
      //encrypt password
      const hashPass = await JWT.encryptPassword(password);

      //get photo
      let photo;
      let public_id;

      if (req.file) {
        const result = await Cloudinary.uploadToCloud(req.file.path);
        if (!result) throw new Error("failed to upload image");
        photo = result?.secure_url;
        public_id = result?.public_id;
      }

      const user = await new User({
        name,
        email,
        username,
        password: hashPass,
        phone,
        photo,
        cloud_public_id: public_id,
        role: "student",
      }).save();

      if (!user) {
        throw new Error("failed to create user");
      }

      // //save data to student schema
      const student = await new Student({
        user_id: user._id,
        class_id,
        rollNo,
        guardian: guardian_data,
      }).save();

      if (!student) throw new Error("Failed to save student's data");

      return res.json({
        success: true,
        data: { user, student },
      });
    } catch (error) {
      next(error);
    }
  }

  

  static async getStudents(req, res, next) {
    try {
      const per_page = parseInt(req.query.size) || 5;
      const current_page = parseInt(req.query.page) || 1;
      const skip = (current_page - 1) * per_page;

      const filter = req.query.filter || "";
      const regex = filter ? new RegExp(filter, "i") : null;

      const pipeline = [
        // Join user
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },

        // Apply filter on user fields
        {
          $match: regex
            ? {
                $or: [
                  { "user.name": regex },
                  { "user.email": regex },
                  { "user.username": regex },
                ],
              }
            : {},
        },

        // Join class
        {
          $lookup: {
            from: "classes",
            localField: "class_id",
            foreignField: "_id",
            as: "classData",
          },
        },
        { $unwind: "$classData" },

        // Join department
        {
          $lookup: {
            from: "departments",
            localField: "classData.department_id",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: "$department" },

        // Facet for pagination
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: per_page }],
          },
        },
      ];

      const result = await Student.aggregate(pipeline);

      const total = result[0].metadata[0]?.total || 0;
      const students = result[0].data;

      return res.json({
        success: true,
        data: students,
        pagination: {
          total,
          per_page,
          current_page,
          total_pages: Math.ceil(total / per_page),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStudent(req, res, next) {
    try {
      const {
        name,
        email,
        username,
        phone,
        guardian,
        rollNo,
        class_id,
        password,
      } = req.body;

      // Extract IDs
      const user_id = req.query.user_id || req.params.user_id;
      const student_id = req.query.id || req.params.id;

      if (!user_id) throw new Error("User ID not provided");
      if (!student_id) throw new Error("Student ID not provided");

      // Find user
      const user = await User.findById(user_id);
      if (!user) throw new Error("User not found");

      // Parse guardian safely
      let guardian_data;
      try {
        guardian_data = guardian ? JSON.parse(guardian) : {};
      } catch {
        throw new Error("Invalid guardian JSON format");
      }

      // Encrypt password if provided
      let hashedPassword = password
        ? await JWT.encryptPassword(password)
        : undefined;

      // Handle photo upload
      let photo = user?.photo;
      let public_id = user?.cloud_public_id;

      if (req?.file) {
        if (!public_id) throw new Error("public id not available");

        const isDeleted = await Cloudinary.deleteFromCloud(public_id);
        if (!isDeleted) throw new Error("Failed to delete previous image");

        const result = await Cloudinary.uploadToCloud(req.file.path);
        if (!result?.secure_url || !result?.public_id) {
          throw new Error("Failed to upload new image to Cloudinary");
        }

        photo = result.secure_url;
        public_id = result.public_id;
      }

      // Prepare update data
      const updateFields = {
        name,
        email,
        phone,
        username,
        class_id,
        guardian: guardian_data,
        cloud_public_id: public_id,
        ...(hashedPassword && { password: hashedPassword }),
        ...(photo && { photo }),
      };

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        user_id,
        { $set: updateFields },
        { new: true }
      );
      if (!updatedUser) throw new Error("Failed to update user");

      // Update student
      const updatedStudent = await Student.findByIdAndUpdate(
        student_id,
        { user_id, class_id, guardian: guardian_data, rollNo },
        { new: true }
      );
      if (!updatedStudent) throw new Error("Student not found");

      return res.json({
        success: true,
        data: { updatedUser, updatedStudent },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteStudent(req, res, next) {
    try {
      //get id from params
      const user_id = req.query.user_id || req.params.user_id;
      const id = req.query.id || req.params.id;

      if (!id) throw new Error("Id not available");
      if (!user_id) throw new Error("user_id not available");

      //fetch user first
      const user = await User.findById(user_id);
      if (!user) throw new Error("user not found!...");

      //check for public_id
      let public_id = user?.cloud_public_id;
      if (!public_id) throw new Error("public id not available");

      //delete image from cloud
      const isDeleted = await Cloudinary.deleteFromCloud(public_id);
      if (!isDeleted) throw new Error("failed to delete data");

      //delete first user
      const deletedUser = await User.findOneAndDelete({ _id: user_id });
      if (!deletedUser) throw new Error("User not found");

      //delete student data
      const deletedStudent = await Student.findOneAndDelete({ _id: id });
      if (!deletedStudent) throw new Error("Student not found");

      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }
}
