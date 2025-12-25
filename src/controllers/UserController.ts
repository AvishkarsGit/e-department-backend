import User from "../models/User";
import { JWT } from "../utils/JWT";
import { NodeMailer } from "../utils/NodeMailer";
import { Utils } from "../utils/Utils";
import { Cloudinary } from "../utils/Cloudinary";
import Faculty from "../models/Faculty";
import Student from "../models/Student";
import mongoose from "mongoose";
import Class from "../models/Class";

export class UserController {
  static async signup(req, res, next) {
    try {
      //get data from the body
      const { name, email, username, password, phone, role, department } =
        req.body;

      let photo;
      let public_id;
      if (req?.file) {
        const result = await Cloudinary.uploadToCloud(req.file.path);
        photo = result?.secure_url;
        public_id = result?.public_id;
      }

      //generate verification token
      const verification_token = Utils.generateVerificationToken();

      //encrypt the password
      const hashPass = await JWT.encryptPassword(password);

      //prepare data to save db
      const data = {
        name,
        email,
        username,
        password: hashPass,
        phone,
        photo,
        role,
        account_status: role === "admin" ? true : false,
        cloud_public_id: public_id,
        verification_token,
        verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
      };

      //save into the db
      const user = await new User(data).save();

      //check role
      if (user?.role === "admin" || user?.role === "faculty") {
        //set admin as faculty as well. Because in our case, admin(HOD) can be faculty as well
        await new Faculty({
          user_id: user._id,
          department_id: department,
        }).save();
      }

      //generate access token and refresh token
      const payload = { id: user._id, role: user.role };

      const accessToken = JWT.generateAccessToken(payload);
      const refreshToken = JWT.generateRefreshToken(payload);

      return res.json({
        success: true,
        // result,
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendVerificationToken(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      //check if id is valid
      if (!user) {
        throw new Error("user does not exists");
      }

      //generate verification token
      const otp = Utils.generateVerificationToken();

      //update that otp in database
      const updated = await User.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            updated_at: Date.now(),
            verification_token: otp,
            verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
          },
        },
        {
          new: true,
        }
      );

      //check if token is updated successfully..
      if (!updated) {
        throw new Error("failed to generate token");
      }

      // send email for this token

      await NodeMailer.sendEmail({
        to: [user.email],
        subject: "Verification token email",
        html: `<h4>Verification token : ${otp}</h4>`,
      });

      return res.json({
        success: true,
        message: "Verification token sent to your email",
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User doesn't exist");
      }

      const updated = await User.findOneAndUpdate(
        {
          email: user.email,
          verification_token: otp,
          verification_token_time: { $gt: Date.now() },
        },
        {
          $set: {
            updated_at: Date.now(),
            email_verified: true,
          },
        },
        {
          new: true,
        }
      ).select(
        "name email phone photo role username email_verified account_status created_at updated_at"
      );

      //check if email is verified
      if (!updated) {
        throw new Error("otp is expired or wrong");
      }

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    const user = req.user;
    const password = req.body.password;
    const encrypt_password = req.user.password;

    try {
      await JWT.comparePassword({
        password,
        encrypt_password: encrypt_password,
      });

      const payload = { id: user._id, role: user.role };

      //generate access token
      const accessToken = JWT.generateAccessToken(payload);
      const refreshToken = JWT.generateRefreshToken(payload);

      return res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async profile(req, res, next) {
    try {
      const userId = req.user.id;

      const pipeline = [
        {
          $match: { _id: new mongoose.Types.ObjectId(userId) },
        },

        // Lookup Faculty details (for subjects + guardians)
        {
          $lookup: {
            from: "faculties",
            localField: "_id",
            foreignField: "user_id",
            as: "facultyData",
            pipeline: [
              {
                $lookup: {
                  from: "subjects",
                  localField: "subjects",
                  foreignField: "_id",
                  as: "subjects",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                        code: 1,
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 0,
                  subjects: 1,
                  guardian: 1,
                },
              },
            ],
          },
        },

        // Lookup Student details (with class + department)
        {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "user_id",
            as: "studentData",
            pipeline: [
              {
                $lookup: {
                  from: "classes",
                  localField: "class_id",
                  foreignField: "_id",
                  as: "classData",
                  pipeline: [
                    {
                      $lookup: {
                        from: "departments",
                        localField: "department_id",
                        foreignField: "_id",
                        as: "department",
                        pipeline: [
                          {
                            $project: {
                              _id: 1,
                              name: 1,
                              code: 1,
                            },
                          },
                        ],
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        year: 1,
                        semester: 1,
                        department: { $arrayElemAt: ["$department", 0] },
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 0,
                  guardian: 1,
                  rollNo: 1, // ✅ Include rollNo here
                  classData: { $arrayElemAt: ["$classData", 0] },
                },
              },
            ],
          },
        },

        // Final projection
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            photo: 1,
            username: 1,
            account_status: 1,
            role: 1,
            created_at: 1,
            email_verified: 1,

            subjects: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$role", "faculty"] },
                    { $eq: ["$role", "admin"] },
                  ],
                },
                then: { $arrayElemAt: ["$facultyData.subjects", 0] },
                else: [],
              },
            },

            guardian: {
              $cond: {
                if: { $eq: ["$role", "faculty"] },
                then: { $arrayElemAt: ["$facultyData.guardian", 0] },
                else: {
                  $cond: {
                    if: { $eq: ["$role", "student"] },
                    then: { $arrayElemAt: ["$studentData.guardian", 0] },
                    else: [],
                  },
                },
              },
            },

            classData: {
              $cond: {
                if: { $eq: ["$role", "student"] },
                then: { $arrayElemAt: ["$studentData.classData", 0] },
                else: null,
              },
            },

            // ✅ Add rollNo to final projection for students
            rollNo: {
              $cond: {
                if: { $eq: ["$role", "student"] },
                then: { $arrayElemAt: ["$studentData.rollNo", 0] },
                else: null,
              },
            },
          },
        },
      ];

      const result = await User.aggregate(pipeline);

      if (!result.length) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.json({
        success: true,
        data: result[0],
      });
    } catch (error) {
      next(error);
    }
  }

  static async viewProfile(req, res, next) {
    try {
      const user_id = req.query.user_id || req.params.user_id;
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }
      const user = await User.findOne({
        _id: user_id,
      }).select(
        "name email photo phone role created_at email_verified username"
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      if (user?.role === "faculty") {
        const faculty = await Faculty.findOne({ user_id: user?._id }).populate(
          "department_id"
        );
        if (!faculty) {
          throw new Error("faculty not found");
        }
        return res.json({
          success: true,
          data: { user, faculty },
        });
      }
      if (user?.role === "student") {
        const student = await Student.findOne({ user_id: user?._id }).populate(
          "class_id"
        );
        if (!student) {
          return res.status(404).json({
            success: false,
            message: "Student not found"
          });
        }
        return res.json({
          success: true,
          data: { user, student },
        });
      }
      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendResendPasswordToken(req, res, next) {
    try {
      const email = req.user.email;
      const otp = Utils.generateVerificationToken();
      const updated = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            updated_at: Date.now(),
            reset_password_verification_token: otp,
            reset_password_verification_token_time:
              Date.now() + Utils.MAX_TOKEN_TIME,
          },
        },
        {
          new: true,
        }
      );

      if (!updated) {
        throw new Error("failed to send token");
      }

      // send to the email
      await NodeMailer.sendEmail({
        to: [email],
        subject: "Reset password otp",
        html: `<h4>Reset Password OTP :${otp}</h4>`,
      });

      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { otp, password } = req.body;
      //encrypt password
      const hashPassword = await JWT.encryptPassword(password);

      const updated = await User.findOneAndUpdate(
        {
          reset_password_verification_token: otp,
          reset_password_verification_token_time: { $gt: Date.now() },
        },
        {
          $set: {
            updated_at: Date.now(),
            password: hashPassword,
          },
        },
        {
          new: true,
        }
      );

      if (!updated) {
        throw new Error("Entered otp is wrong or expired");
      }

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyResetPasswordOtp(req, res, next) {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({
        email,
        reset_password_verification_token: otp,
        reset_password_verification_token_time: { $gt: Date.now() },
      });
      if (!user) {
        throw new Error("Entered otp is wrong or expired");
      }
      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  //check if admin is exists
  static async checkAdminExists(req, res, next) {
    try {
      const admin_exists = await User.findOne({ role: "admin" });
      let isAdmin = false;
      if (admin_exists) {
        isAdmin = true;
      }
      return res.json({
        success: true,
        data: {
          admin_exists: isAdmin,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const incomingRefreshToken = req.body.refreshToken;

      const decoded = await JWT.jwtVerifyRefreshToken(incomingRefreshToken);
      if (!decoded) {
        throw new Error("invalid refresh token");
      }

      const payload = {
        id: decoded.id,
        role: decoded.role,
      };

      const accessToken = JWT.generateAccessToken(payload);
      const refreshToken = JWT.generateRefreshToken(payload);

      return res.json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    let per_page = parseInt(req.query.size) || 5;
    let current_page = parseInt(req.query.page) || 1;

    try {
      // Filter handling
      const filter = req.query.filter || "";
      const isCard = req.query.isCard;
      let query: any = {};
      if (filter) {
        const regex = new RegExp(filter, "i");
        query = {
          $or: [
            { name: regex },
            { email: regex },
            { username: regex },
            { phone: regex },
            { role: regex },
          ],
        };
      }

      //if isCard is true ,then show only the faculty
      if (isCard) {
        query.role = "faculty";
      }

      // Total documents after filter
      const users_doc_count = await User.countDocuments(query);
      const total_pages = Math.ceil(users_doc_count / per_page);

      // Adjust current_page if out of range
      if (total_pages === 0) current_page = 1;
      else if (current_page > total_pages) current_page = 1;

      // Fetch paginated data
      const users = await User.find(query)
        .skip((current_page - 1) * per_page)
        .limit(per_page);

      return res.json({
        data: users,
        pagination: {
          current_page,
          prev_page: current_page > 1 ? current_page - 1 : null,
          next_page: current_page < total_pages ? current_page + 1 : null,
          total: users_doc_count,
          total_pages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const users = await User.find({});

      return res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  //add user
  static async addUser(req, res, next) {
    try {
      const { name, email, phone, role, password } = req.body;

      const username = Utils.generateUsername(name);
      const hashedPass = await JWT.encryptPassword(password);

      if (role === "admin") throw new Error("Only one admin is allowed!...");

      let photo;
      let public_id;
      if (req?.file) {
        const result = await Cloudinary.uploadToCloud(req.file.path);
        photo = result.secure_url;
        public_id = result?.public_id;
      }

      const user = await new User({
        name,
        email,
        phone,
        photo,
        role,
        username,
        cloud_public_id: public_id,
        password: hashedPass,
      }).save();

      if (!user) {
        throw new Error("failed to add user");
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  //update user
  static async updateUser(req, res, next) {
    try {
      const { name, email, phone, role } = req.body;

      const id = req.params.id;
      if (!id) {
        throw new Error("id is not available");
      }

      // find user first
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      let public_id = user.cloud_public_id;
      let photo;

      //get file path
      if (req?.file) {
        // delete old photo if exists
        if (public_id) {
          const deleted = await Cloudinary.deleteFromCloud(public_id);
          if (!deleted)
            throw new Error("Failed to delete old image from Cloudinary");
        }

        // upload new photo
        const result = await Cloudinary.uploadToCloud(req.file.path);
        if (!result?.secure_url || !result?.public_id) {
          throw new Error("Failed to upload new image to Cloudinary");
        }

        photo = result.secure_url;
        public_id = result.public_id;
      }

      const data = {
        name,
        email,
        phone,
        role,
        cloud_public_id: public_id,
      };

      const finalData = photo ? { ...data, photo } : data;
      const updated_user = await User.findOneAndUpdate(
        {
          _id: id,
        },
        { ...finalData },
        {
          new: true,
        }
      );

      if (!updated_user) {
        throw new Error("Failed to update user");
      }

      return res.json({
        success: true,
        data: updated_user,
      });
    } catch (error) {
      next(error);
    }
  }

  //delete user
  static async deleteUser(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error("Id is not available");
      }

      //find user first
      const user = await User.findOne({ _id: id });
      if (!user) throw new Error("User not found");

      //delete image from cloudinary
      const deleted = await Cloudinary.deleteFromCloud(user?.cloud_public_id);
      if (!deleted) throw new Error("failed to delete previous image");

      const deletedUser = await User.findOneAndDelete({ _id: user?._id });

      if (!deletedUser) {
        throw new Error("failed to delete user");
      }

      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { name, phone, guardians, department, semester, year, rollNo } =
        req.body;
      const id = req.user.id;
      if (!id) throw new Error("Id not found");

      //find user first
      const user = await User.findOne({ _id: id });
      if (!user) throw new Error("User not found");

      let public_id = user?.cloud_public_id;

      //check if photo is selected
      let photo;
      if (req.file) {
        //check if public id is available
        if (!public_id) throw new Error("You have no public id");

        //first delete previous photo from cloudinary
        const deleted = await Cloudinary.deleteFromCloud(public_id);
        if (!deleted) throw new Error("Failed to delete image from cloud");

        //upload to the cloud
        const result = await Cloudinary.uploadToCloud(req.file.path);
        photo = result?.secure_url;
        public_id = result?.public_id;
      }

      let data = { name, phone, cloud_public_id: public_id };
      let finalData = photo ? { ...data, photo } : data;

      const updatedData = await User.findOneAndUpdate(
        {
          _id: id,
        },
        { ...finalData },
        {
          new: true,
        }
      );

      if (!updatedData) {
        throw new Error("Failed to update");
      }

      // Only update if guardians or class-related fields are provided
      if (
        (guardians && guardians !== "[]" && guardians !== "{}") ||
        (department && semester && year) ||
        rollNo
      ) {
        // Make sure user is a student
        const student = await Student.findOne({ user_id: user._id });
        if (!student) {
          console.log("User is not a student, skipping student update.");
        } else {
          const guardianData = guardians
            ? JSON.parse(guardians)
            : student.guardian;

          let classId = student.class_id; // keep old class if no new one provided
          if (department && semester && year) {
            const classData = await Class.findOne({
              department_id: department,
              semester,
              year,
            })
              .select("_id")
              .lean();

            if (!classData) throw new Error("Class not found");
            classId = classData._id;
          }

          const isStudentUpdated = await Student.findOneAndUpdate(
            { user_id: user._id },
            {
              $set: {
                guardian: guardianData,
                class_id: classId,
                rollNo,
              },
            },
            { new: true }
          );

          if (!isStudentUpdated)
            throw new Error("Failed to update student info");
        }
      }

      return res.json({
        success: true,
        data: updatedData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkUserExists(req, res, next) {
    try {
      const { email } = req.query || req.params;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }
      const user = await User.findOne({ email }).select(
        "name email email_verified"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.json({
        success: true,
        data: {
          exists: true,
          user: user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }
      //generate otp
      const otp = Utils.generateVerificationToken(6);

      const updated = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            updated_at: Date.now(),
            verification_token: otp,
            verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
          },
        },
        {
          new: true,
        }
      );

      if (!updated) {
        throw new Error("Failed to update");
      }

      //send email
      await NodeMailer.sendEmail({
        to: [email],
        subject: "Email Verification",
        html: `<h4>Verification OTP :${otp}</h4>`,
      });

      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  static async acceptUser(req, res, next) {
    try {
      const { id, status } = req.body;
      console.log("id", id);
      console.log("status", status);
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID is required"
        });
      }
      if (typeof status === 'undefined') {
        return res.status(400).json({
          success: false,
          message: "Status is required"
        });
      }
      const user = await User.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            account_status: status,
          },
        },
        {
          new: true,
        }
      );
      if (!user) throw new Error("failed to update status");

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
