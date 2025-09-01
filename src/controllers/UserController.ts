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
      const user = await User.findOne({ _id: req.user.id }).select(
        "-password -verification_token -verification_token_time -reset_password_verification_token -reset_password_verification_token_time -created_at -updated_at -__v"
      );
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

  //check if admin is exists
  static async checkAdminExists(req, res, next) {
    try {
      const admin_exists = await User.find({ role: "admin" });
      if (admin_exists) {
        return false;
      }

      return res.json({
        data: admin_exists,
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

  static async getUsers(req, res, next) {
    let per_page = parseInt(req.query.size) || 5;
    let current_page = parseInt(req.query.page) || 1;

    try {
      // Filter handling
      const filter = req.query.filter || "";
      let query = {};
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
      const user = await new User({
        name,
        email,
        phone,
        photo: " ",
        role,
        username,
        verification_token: " ",
        reset_password_verification_token: " ",
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

      const updated_user = await User.findOneAndUpdate(
        {
          _id: id,
        },
        {
          name,
          email,
          phone,
          role,
        },
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
}
