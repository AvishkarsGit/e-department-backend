import Faculty from "../models/Faculty";
import { JWT } from "../utils/JWT";
import User from "../models/User";
import { Cloudinary } from "../utils/Cloudinary";

export class FacultyController {
  //creating the faculty
  static async createFaculty(req, res, next) {
    try {
      const { name, email, username, password, phone, department_id } =
        req.body;

      let photo;
      let public_id;

      if (req.file) {
        const result = await Cloudinary.uploadToCloud(req.file.path);
        if (!result) throw new Error("failed to upload image");
        photo = result?.secure_url;
        public_id = result?.public_id;
      }

      const hashPass = await JWT.encryptPassword(password);

      const user = await new User({
        name,
        email,
        username,
        photo,
        password: hashPass,
        cloud_public_id: public_id,
        phone,
        role: "faculty",
      }).save();

      if (!user) {
        throw new Error("Fail to create the user");
      }

      const faculty = await new Faculty({
        user_id: user._id,
        department_id,
      }).save();

      if (!faculty) {
        throw new Error("Fail to load the faculty");
      }

      res.json({
        success: true,
        data: { user, faculty },
      });
    } catch (error) {
      next(error);
    }
  }

  // Read faculty with filter + pagination
  static async getFaculty(req, res, next) {
    try {
      const per_page = parseInt(req.query.size) || 5;
      const current_page = parseInt(req.query.page) || 1;
      const skip = (current_page - 1) * per_page;

      const filter = req.query.filter || "";
      const regex = filter ? new RegExp(filter, "i") : null;

      const pipeline = [
        // Join User
        {
          $lookup: {
            from: "users", // must match collection name in DB
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },

        // Join Department
        {
          $lookup: {
            from: "departments",
            localField: "department_id",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: "$department" },

        // Apply filter across user
        ...(regex
          ? [
              {
                $match: {
                  $or: [
                    { "user.name": regex },
                    { "user.email": regex },
                    { "user.username": regex },
                  ],
                },
              },
            ]
          : []),

        // Pagination facet
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
      });
    } catch (error) {
      next(error);
    }
  }

  //Update Faculty
  static async updateFaculty(req, res, next) {
    try {
      const { name, email, username, phone, department_id } = req.body;

      const user_id = req.params.user_id || req.query.user_id;
      const id = req.params.id || req.query.id;

      if (!user_id) throw new Error("user_id Not available");
      if (!id) throw new Error("Id not available");

      const user = await User.findOne({ _id: user_id });
      if (!user) {
        throw new Error("User not found");
      }

      const password = req.body.password;

      let hashedPassword;
      if (password) {
        hashedPassword = await JWT.encryptPassword(password);
      }

      let photo;
      let public_id = user.cloud_public_id;

      if (req.file) {
        const deleted = await Cloudinary.deleteFromCloud(public_id);
        if (!deleted) throw new Error("Fail to delete Image");
        const result = await Cloudinary.uploadToCloud(req.file.path);
        if (!result) throw new Error("failed to upload image");
        photo = result?.secure_url;
        public_id = result?.public_id;
      }

      const data = {
        name,
        email,
        username,
        password: hashedPassword,
        phone,
        photo,
        cloud_public_id: public_id,
      };

      console.log("UpdatedData:", data);

      const PhotoAdded = photo ? { ...data, photo } : data;

      const updatedData = { ...data, PhotoAdded };

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          $set: { ...updatedData },
        },
        {
          new: true,
        }
      );
      if (!updatedUser) throw new Error("User is not found");

      const faculty = await Faculty.findOneAndUpdate(
        {
          _id: id,
        },
        {
          user_id: user._id,
          department_id: department_id,
        },
        {
          new: true,
        }
      );

      if (!faculty) throw new Error("Faculty is not found");

      return res.json({
        success: true,
        data: { user, faculty },
      });
    } catch (error) {
      console.log("Update problem", error);
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

      //fetch user first
      const user = await User.findById(user_id);
      if (!user) throw new Error("user not found!...");

      //check for public_id
      let public_id = user?.cloud_public_id;
      if (!public_id) throw new Error("public id not available");

      //delete image from cloud
      const isDeleted = await Cloudinary.deleteFromCloud(public_id);
      if (!isDeleted) throw new Error("failed to delete data");

      //delete frist User
      const deletedUser = await User.findOneAndDelete({ _id: user_id });
      if (!deletedUser) throw new Error("User is not found");

      //delete Faculty data
      const deletedFaculty = await Faculty.findOneAndDelete({ _id: id });
      if (!deletedFaculty) throw new Error("Faculty is not found");

      return res.json({
        success: true,
        message: "Data deleted Successfully",
      });
    } catch (error) {
      throw error;
    }
  }
}
