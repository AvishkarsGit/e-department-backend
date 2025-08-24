import { EmitFlags } from "typescript";
import User from "../model/User";
import { JWT } from "../utils/JWT";
import { NodeMailer } from "../utils/NodeMailer";
import { Utils } from "../utils/Utils";

export class UserController {
  static async signup(req, res, next) {
    try {
      //get data from the body
      const { name, email, username, password, phone, profile, role } =
        req.body;

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
        profile,
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
        token: accessToken,
        refreshToken,
        data: user,
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
        token: accessToken,
        refreshToken,
        user: req.user,
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
      const { name, email } = req.body;

      //generate username and password for the faculty;
      const username = Utils.generateUsername(name);
      const password = Utils.generatePassword(name);

      // encrypt password
      const hashedPass = await JWT.encryptPassword(password);

      //generate verification token
      const otp = Utils.generateVerificationToken();

      const user = await new User({
        name,
        email,
        username,
        password: hashedPass,
        phone: " ",
        profile: " ",
        role: "Faculty",
        verification_token: " ",
        verification_token_time: Date.now(),
        reset_password_verification_token: " ",
        reset_password_verification_token_time: Date.now(),
      }).save();

      // send email on faculties email

      await NodeMailer.sendEmail({
        to: [email],
        subject: "Account creation email",
        html: `<h4>Verification Token : ${otp} </h4>`,
      });

      return res.json({
        success: true,
        username,
        password,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
