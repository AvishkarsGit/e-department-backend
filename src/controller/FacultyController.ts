import Faculty from "../model/Faculty";
import User from "../model/User";
import { JWT } from "../utils/JWT";
import { NodeMailer } from "../utils/NodeMailer";
import { Utils } from "../utils/Utils";

export class FacultyController {
  static async login(req, res, next) {
    try {
      const { password } = req.body;
      const user = req.user;

      //decrypt password
      await JWT.comparePassword({
        password,
        encrypt_password: user.password,
      });

      // generate access and refresh token
      const accessToken = JWT.generateAccessToken({ id: user._id });
      const refreshToken = JWT.generateRefreshToken({ id: user._id });

      return res.json({
        success: true,
        accessToken,
        refreshToken,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async profile(req, res, next) {
    try {
      const id = req.user.id;
      const user = await User.findOne({ _id: id });

      if (!user) {
        throw new Error("User not found");
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { name, phone, profile } = req.body;

      const user = req.user;
      const updatedUser = await User.findOneAndUpdate(
        { _id: user.id },
        {
          $set: {
            name,
            phone,
            profile,
          },
        },
        {
          new: true,
        }
      );

      if (!updatedUser) {
        throw new Error("failed to update user");
      }

      return res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendVerificationToken(req, res, next) {
    try {
      const id = req.user.id;
      const otp = Utils.generateVerificationToken();
      const updated = await User.findOneAndUpdate(
        { _id: id },
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
        throw new Error("failed to generate token");
      }

      //send email
      await NodeMailer.sendEmail({
        to: [updated.email],
        subject: "Verification token",
        html: `<h4> Verification token : ${otp} </h4>`,
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { otp } = req.body;
      const isUpdated = await User.findOneAndUpdate(
        {
          _id: req.user.id,
          verification_token: otp,
          verification_token_time: { $gt: Date.now() },
        },
        {
          updated_at: Date.now(),
          email_verified: true,
        },

        {
          new: true,
        }
      );

      if (!isUpdated) {
        throw new Error("enter otp is wrong or expired");
      }

      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendResetPasswordToken(req, res, next) {
    try {
      const user = req.user;
      const otp = Utils.generateVerificationToken();
      const updated = await User.findOneAndUpdate(
        { email: user.email },
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
        throw new Error("Failed to send token");
      }

      //send email

      await NodeMailer.sendEmail({
        to: [user.email],
        subject: "Reset password token",
        html: `<h4>Reset password token : ${otp}</h4>`,
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const user = req.user;
      const { new_password } = req.body;

      //encrypt password
      const hashPass = await JWT.encryptPassword(new_password);

      const updated = await User.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            updated_at: Date.now(),
            password: hashPass,
          },
        },
        {
          new: true,
        }
      );
      if (!updated) {
        throw new Error("failed to update password");
      }

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
