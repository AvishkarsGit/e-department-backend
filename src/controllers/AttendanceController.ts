import Attendance from "../models/Attendance";
import Session from "../models/Session";
import Student from "../models/Student";
import StudentAttendanceSummary from "../models/StudentAttendanceSummary";
import Subject from "../models/Subject";

export class AttendanceController {
  static async getStudentsBySubject(req, res, next) {
    try {
      const subject_id = req.query.subject_id || req.params.subject_id;
      const subject = await Subject.findById(subject_id).select("class_id");
      if (!subject) throw new Error("Subject not found");

      const class_id = subject.class_id;

      const students = await Student.aggregate([
        { $match: { class_id } },

        // Sort by rollNo in ascending order
        { $sort: { rollNo: 1 } },

        // Join user
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },

        // Join class
        {
          $lookup: {
            from: "classes",
            localField: "class_id",
            foreignField: "_id",
            as: "classData",
          },
        },
        { $unwind: "$classData" },

        // Join department
        {
          $lookup: {
            from: "departments",
            localField: "classData.department_id",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: "$department" },
      ]);

      return res.json({
        success: true,
        data: students,
        pagination: {
          total: students.length, // total count
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async saveAttendance(req, res, next) {
    try {
      const {
        class_id,
        subject_id,
        faculty_id,
        period_number,
        attendance,
        date,
      } = req.body;

      //parse attendance array into JSON
      const data = JSON.parse(attendance);

      //check if session is exist or not, means check whether attendance is taken for that period
      const existingSession = await Session.findOne({
        class_id,
        subject_id,
        faculty_id,
        date: new Date(date),
        period_number,
      });

      if (!existingSession)
        throw new console.error("Attendance already taken for this period");

      //create new session
      const session = await new Session({
        class_id,
        subject_id,
        faculty_id,
        date,
      }).save();

      if (!session) throw new Error("Session not created!..");

      // create one array for students attendance record
      const attendanceArray = data.map((a) => ({
        session_id: session._id,
        student_id: a.student_id,
        period_number: period_number,
        status: a.status,
      }));

      //insert in bulk
      await Attendance.insertMany(attendanceArray);

      //update monthly summary detail
      const month = new Date(date).toISOString().slice(0, 7); //e.g '2025-09'

      const bulkUpdates = attendance.map((a) => ({
        updateOne: {
          filter: {
            student_id: a.student_id,
            subject_id,
            class_id,
            month: new Date(`${month}-01`),
          },
          update: {
            $inc: {
              total_classes: 1,
              attended_classes: a.status === "present" ? 1 : 0,
            },
          },
          upsert: true, // create if not exists
        },
      }));

      await StudentAttendanceSummary.bulkWrite(bulkUpdates);

      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllSubjects(req, res, next) {
    try {
      const subjects = await Subject.find({});

      if (!subjects) throw new Error("no subjects found");

      return res.json({ success: true, data: subjects });
    } catch (error) {
      next(error);
    }
  }
}
