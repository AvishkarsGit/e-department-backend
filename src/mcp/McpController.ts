import Attendance from "../models/Attendance";
import AttendanceSummary from "../models/AttendanceSummary";
import Student from "../models/Student";
import User from "../models/User";
import { JWT } from "../utils/JWT";

export class McpController {
  static async getAllUsers() {
    try {
      const users = await User.find({}).select(
        "name email phone photo username role"
      );
      if (!users) {
        throw new Error("Error fetching users");
      }

      return users;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAttendanceRaw(userId?: string) {
    if (!userId) throw new Error("User ID is required");

    const student = await Student.findOne({ user_id: userId });
    if (!student) throw new Error("Student not found");

    // Get attendance counts directly
    const attendances = await Attendance.find({
      student_id: student._id,
    }).lean();
    const totalLectures = attendances.length;
    const attendedLectures = attendances.filter(
      (a) => a.status === "present"
    ).length;
    const percentage = totalLectures
      ? (attendedLectures / totalLectures) * 100
      : 0;

    return {
      attendedLectures,
      totalLectures,
      percentage: Number(percentage.toFixed(1)),
    };
  }

  static async generateSummaries(studentId: string) {
    const pipeline = [
      { $match: { student_id: studentId } },
      {
        $group: {
          _id: "$subject_id",
          total_classes: { $sum: 1 },
          attended_classes: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          subject_id: "$_id",
          total_classes: 1,
          attended_classes: 1,
          attendance_percentage: {
            $multiply: [
              { $divide: ["$attended_classes", "$total_classes"] },
              100,
            ],
          },
        },
      },
    ];

    const result = await Attendance.aggregate(pipeline);

    await Promise.all(
      result.map(async (item) => {
        const anyAttendance = await Attendance.findOne({
          student_id: studentId,
          subject_id: item.subject_id,
        }).select("class_id");

        await AttendanceSummary.findOneAndUpdate(
          { student_id: studentId, subject_id: item.subject_id },
          {
            $set: {
              class_id: anyAttendance?.class_id,
              total_classes: item.total_classes,
              attended_classes: item.attended_classes,
              attendance_percentage: item.attendance_percentage,
              last_updated: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      })
    );
  }

  static async decodeToken(token: string) {
    try {
      const decoded = await JWT.jwtVerify(token);
      if (!decoded) throw new Error("Invalid token");
      return decoded;
    } catch (error) {
      throw new Error(error);
    }
  }
}
