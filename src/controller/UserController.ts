import User from "../models/User";
import { Utils } from "../utils/Utils";
import { NodeMailer } from "../utils/NodeMailer";
import { JWT } from "../utils/JWT";

class UserController {
  static async signup(req, res, next) {
    const {
      name,
      email,
      username,
      password,
      profilePhoto,
      phone,
      department,
      year,
      semester,
      guardianPhone,
    } = req.body;

    const verification_token = Utils.generateVerificationToken();
    const hashedPass = await JWT.encryptPassword(password);

    const data = {
      name,
      email,
      username,
      password: hashedPass,
      profilePhoto,
      phone,
      department,
      year,
      semester,
      guardianPhone,
      verification_token,
      verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
    };

    try {
      //check if user is already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      //save user
      let user = await new User(data).save();

      //generate access token
      const accessToken = JWT.generateAccessToken({ id: user._id }, user._id);
      const refreshToken = JWT.generateRefreshToken({ id: user._id }, user.id);

      const email_data = {
        to: [user.email],
        subject: "Verifying email",
        html: `<h1>Verification Token : ${verification_token}</h1>`,
      };

      await NodeMailer.sendEmail(email_data);

      res.json({ token: accessToken, refreshToken, user });
    } catch (error) {
      next(error);
    }
  }

  static async verify(req, res, next) {
    const { email, verification_token } = req.body;

    try {
      const user = await User.findOneAndUpdate(
        {
          email,
          verification_token,
          verification_token_time: { $gt: Date.now() },
        },
        {
          email_verified: true,
        },
        {
          new: true,
        }
      );

      if (user) {
        // send
        res.send(user);
      } else {
        throw new Error(
          "Email verification token is expired. Please try again..."
        );
      }
    } catch (error) {
      next(error);
    }
  }

  static async resendVerificationToken(req, res, next) {
    const email = req.body.email;
    try {
      //check if user is exists
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User does not exist");
      }

      //generate verification_token
      const verification_token = Utils.generateVerificationToken();

      const response = await User.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            verification_token: verification_token,
            verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
          },
        },
        {
          new: true,
        }
      );

      //check if response generated or not
      if (!response) {
        throw new Error("failed to generate...");
      }

      //send to the email
      await NodeMailer.sendEmail({
        to: [user.email],
        subject: "Resend Verification token",
        html: `<h3>Verification Token :${verification_token}</h3>`,
      });

      res.send(response);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    const user = req.user;
    const password = req.query.password;
    const encrypt_password = req.user.password;
    const data = {
      password: password,
      encrypt_password,
    };
    try {
      //check if user is exists or not

      await JWT.comparePassword(data);

      //generate access token
      const accessToken = JWT.generateAccessToken({ id: user._id }, user.id);
      const refreshToken = JWT.generateRefreshToken({ id: user._id }, user.id);

      res.json({
        token: accessToken,
        refreshToken,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async profile(req, res, next) {
    const id = req.user.id;
    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        throw new Error("User not found");
      }

      res.json({
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendResetPasswordToken(req, res, next) {
    try {
      const email = req.query.email;
      const new_verification_token = Utils.generateVerificationToken();

      const user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            updatedAt: new Date(),
            reset_password_verification_token: new_verification_token,
            reset_password_verification_token_time:
              Date.now() + Utils.MAX_TOKEN_TIME,
          },
        },
        {
          new: true,
        }
      );

      if (!user) {
        throw new Error("user doesn't exist");
      }

      NodeMailer.sendEmail({
        to: [email],
        subject: "Password reset token",
        html: `<h3>Password Reset Token ${new_verification_token}</h3>`,
      });
      return res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  static async verifyResetPasswordToken(req, res, next) {
    return res.json({ success: true });
  }

  static async resetPassword(req, res, next) {
    const user = req.user;
    const new_password = req.body.new_password;
    try {
      const encryptedPassword = await JWT.encryptPassword(new_password);
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          updated_at: new Date(),
          password: encryptedPassword,
        },
        { new: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        throw new Error("User doesn't exist");
      }
    } catch (e) {
      next(e);
    }
  }

  static async updateProfile(req, res, next) {
    const id = req.user.id;
    try {
      const { name, phone } = req.body;
      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            updatedAt: Date.now(),
            name,
            phone,
          },
        },
        {
          new: true,
        }
      );

      if (!updatedUser) {
        throw new Error("Failed to update");
      }
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  static async refreshTheToken(req, res, next) {
    try {
      const incomingRefreshToken = req.body.refreshToken;

      const decoded = await JWT.jwtVerifyRefreshToken(incomingRefreshToken);
      if (!decoded) {
        throw new Error("invalid refresh token");
      }

      //generate new access token and refreshToken as well
      const payload = {
        id: decoded.id,
      };
      
      const accessToken = JWT.generateAccessToken(payload, decoded.id);
      const refreshToken = JWT.generateRefreshToken(payload, decoded.id);

      res.json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default UserController;
