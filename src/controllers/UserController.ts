import { EmitFlags } from "typescript";
import User from "../models/User";
import { JWT } from "../utils/JWT";
import { NodeMailer } from "../utils/NodeMailer";
import { Utils } from "../utils/Utils";
import Faculty from "../models/Faculty";
import Department from "../models/Department";

export class UserController {
  static async signup(req, res, next) {
    try {
      //get data from the body
      const { name, email, username, password, phone, photo, role } = req.body;

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
        verification_token,
        verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
      };

      //save into the db
      const user = await new User(data).save();

      //generate access token and refresh token
      const payload = { id: user._id };

      const accessToken = JWT.generateAccessToken(payload);
      const refreshToken = JWT.generateRefreshToken(payload);

      // send verification token on email
      const email_data = {
        to: [email],
        subject: "Account creation email",
        html: `<h4>Verification token : ${verification_token}</h4>`,
      };

      await NodeMailer.sendEmail(email_data);

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

  static async sendVerificationToken(req, res, next) {
    try {
      const id = req.user.id;
      const user = await User.findOne({ _id: id });

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
      const otp = req.body.otp;
      const id = req.user.id;
      const user = await User.findOne({ _id: id });

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

      //generate access token
      const accessToken = JWT.generateAccessToken({ id: user._id });
      const refreshToken = JWT.generateRefreshToken({ id: user._id });

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
      const user = await User.findOne({ _id: req.user.id });
      if (!user) {
        throw new Error("user not found");
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
      const { otp, new_password } = req.body;

      //encrypt password
      const hashPassword = await JWT.encryptPassword(new_password);

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

  static async refreshToken(req, res, next) {
    try {
      const incomingRefreshToken = req.body.refreshToken;

      const decoded = await JWT.jwtVerifyRefreshToken(incomingRefreshToken);
      if (!decoded) {
        throw new Error("invalid refresh token");
      }

      const payload = {
        id: decoded.id,
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

  static async createFaculty(req, res, next) {
    try {
      const { name, email, phone, password } = req.body;

      //generate username and password for the faculty;
      const username = Utils.generateUsername(name);
      // const password = Utils.generatePassword(name);

      // encrypt password
      const hashedPass = await JWT.encryptPassword(password);

      //generate verification token
      const otp = Utils.generateVerificationToken();

      const user = await new User({
        name,
        email,
        username,
        password: hashedPass,
        phone,
        photo: " ",
        role: "Faculty",
        verification_token: " ",
        verification_token_time: Date.now(),
        reset_password_verification_token: " ",
        reset_password_verification_token_time: Date.now(),
      }).save();

      //get department
      const department = await Department.findOne({ name: "Computer" });

      //save into faculty collection
      await new Faculty({
        user_id: user._id,
        department: department._id,
        faculty_role: "faculty",
      }).save();

      // send email on faculties email

      await NodeMailer.sendEmail({
        to: [email],
        subject: "Account creation email",
        html: `<h4>Verification Token : ${otp} </h4>`,
      });

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateFaculty(req, res, next) {
    const { name, email, phone } = req.body;
    const id = req.query.id;
    try {
      if (!id) {
        throw new Error("id is not available");
      }
      const updated = await User.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            updated_at: Date.now(),
            name,
            email,
            phone,
          },
        },
        {
          new: true,
        }
      );

      if (!updated) {
        throw new Error("failed to update");
      }

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFaculty(req, res, next) {
    try {
      const id = req.query._id;
      if (!id) {
        throw new Error("Id is not available");
      }
      const deletedUser = await User.findOneAndDelete({ _id: id });
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

  static async addDepartment(req, res, next) {
    try {
      const { name } = req.body;
      const department = await new Department({ name }).save();
      if (!department) {
        throw new Error("failed to create department");
      }

      return res.json({
        success: true,
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req, res, next) {
    const perPage = 5;
    const currentPage = parseInt(req.query.page) || 1;
    const prevPage = currentPage == 1 ? null : currentPage - 1;
    let nextPage = currentPage + 1;
    try {
      const users_doc_count = await User.countDocuments();
      const totalPages = Math.ceil(users_doc_count / perPage);
      if (totalPages == 0 || totalPages == currentPage) {
        nextPage = null;
      }

      if (totalPages < currentPage) {
        throw "no more user available";
      }
      const users = await User.find({})
        .skip(currentPage * perPage - perPage)
        .limit(perPage);

      return res.json({
        data: users,
        perPage,
        currentPage,
        prevPage,
        nextPage,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  }
}
