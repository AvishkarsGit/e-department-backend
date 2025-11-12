import { success } from "zod/v4";
import Attendance from "../models/Attendance";
import ClassSession from "../models/ClassSession";
import Student from "../models/Student";
import User from "../models/User";

export class DashboardController {
  static async getBoxesData(req, res, next) {
    try {
      const user = req.user;
      // Fetch total users first (common to all)
      const totalUsersPromise = User.countDocuments().exec();

      // If Admin or Faculty
      if (user.role === "admin" || user.role === "faculty") {
        const [totalUsers, totalStudents, totalFaculties, lectures] =
          await Promise.all([
            totalUsersPromise,
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "faculty" }),
            ClassSession.countDocuments({ faculty_id: user.id }),
          ]);

        return res.json({
          success: true,
          data: { totalUsers, totalStudents, totalFaculties, lectures },
        });
      }

      // Else Student
      const student = await Student.findOne({ user_id: user.id })
        .select("class_id _id")
        .lean();

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student record not found",
        });
      }

      // Parallelize lecture and attendance queries
      const [totalUsers, lectures, attendances] = await Promise.all([
        totalUsersPromise,
        ClassSession.countDocuments({ class_id: student.class_id }),
        Attendance.find({ student_id: student._id }).select("status").lean(),
      ]);

      const lecturesAttended = attendances.filter(
        (a) => a.status === "present"
      ).length;
      const percentage = lectures > 0 ? (lecturesAttended / lectures) * 100 : 0;

      return res.json({
        success: true,
        data: {
          totalUsers,
          lectures,
          lecturesAttended,
          percentage: Number(percentage.toFixed(2)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
