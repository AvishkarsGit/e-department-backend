import User from "../model/User";
import { JWT } from "../utils/JWT";

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
}
