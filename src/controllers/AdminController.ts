import Department from "../models/Department";
import Faculty from "../models/Faculty";
import User from "../models/User";
import { JWT } from "../utils/JWT";
import { NodeMailer } from "../utils/NodeMailer";
import { Utils } from "../utils/Utils";

export class AdminController {
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
    const id = req.params.id;
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
}
