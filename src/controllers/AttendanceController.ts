import mongoose from "mongoose";
import Attendance from "../models/Attendance";
import AttendanceSummary from "../models/AttendanceSummary";
import Class from "../models/Class";
import ClassSession from "../models/ClassSession";
import Period from "../models/Period";
import Student from "../models/Student";
import Subject from "../models/Subject";
import User from "../models/User";

export class AttendanceController {
  static async getSubjects(req, res, next) {
    try {
      const subjects = await Subject.find({});

      if (!subjects) throw new Error("subjects not found!..");

      return res.json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPeriods(req, res, next) {
    try {
      const periods = await Period.find({});
      if (!periods) throw new Error("no periods found");

      return res.json({
        success: true,
        data: periods,
      });
    } catch (error) {
      next(error);
    }
  }

  static async fetchStudentsBySubject(req, res, next) {
    try {
      const subject_id = req.params.subject_id;
      if (!subject_id) throw new Error("subject not provided");

      // Find subject to get class_id
      const subject = await Subject.findOne({ _id: subject_id }).select(
        "class_id"
      );
      if (!subject) throw new Error("subject not found");

      const pipeline = [
        // Match students from the same class
        {
          $match: { class_id: subject.class_id },
        },

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
      ];

      const students = await Student.aggregate(pipeline);

      if (!students || students.length === 0) {
        throw new Error("students not found!");
      }

      return res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      next(error);
    }
  }
  static async saveAttendance(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { subject_id, faculty_id, period_id, date, attendance } = req.body;

      if (!subject_id || !faculty_id || !period_id || !date || !attendance) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const attendanceArray =
        typeof attendance === "string" ? JSON.parse(attendance) : attendance;

      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      // ✅ Get class from subject
      const subject = await Subject.findById(subject_id).select("class_id");
      if (!subject) throw new Error("Subject not found");
      const class_id = subject.class_id;

      // ✅ Prevent duplicate attendance for period/class/date
      const existingSession = await ClassSession.findOne({
        class_id,
        period: period_id,
        date: attendanceDate,
      }).session(session);

      if (existingSession) {
        return res.status(400).json({
          success: false,
          message: "Attendance for this period already taken.",
        });
      }

      // ✅ Create new session
      const [newSession] = await ClassSession.create(
        [
          {
            class_id,
            subject_id,
            faculty_id,
            period: period_id,
            date: attendanceDate,
          },
        ],
        { session }
      );

      const sessionId = newSession._id;

      // ✅ Insert attendance documents
      const attendanceDocs = attendanceArray.map((att) => ({
        session_id: sessionId,
        student_id: att.student_id,
        class_id,
        subject_id,
        date: attendanceDate,
        status: att.status,
      }));

      await Attendance.insertMany(attendanceDocs, { session });

      // ✅ Update summaries with $inc and calculate percentage separately
      const bulkOps = attendanceArray.map((att) => ({
        updateOne: {
          filter: { student_id: att.student_id, subject_id, class_id },
          update: {
            $inc: {
              total_classes: 1,
              attended_classes: att.status === "present" ? 1 : 0,
            },
            $set: { last_updated: new Date() },
          },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await AttendanceSummary.bulkWrite(bulkOps, { session });
      }

      // ✅ Recalculate percentages after increments
      await AttendanceSummary.updateMany(
        { class_id, subject_id },
        [
          {
            $set: {
              attendance_percentage: {
                $cond: [
                  { $eq: ["$total_classes", 0] },
                  0,
                  {
                    $multiply: [
                      { $divide: ["$attended_classes", "$total_classes"] },
                      100,
                    ],
                  },
                ],
              },
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        data: { message: "Attendance saved successfully." },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  }

  static async fetchSubjectsByClass(req, res, next) {
    try {
      const class_id = req.params.class_id || req.query.class_id;

      if (!class_id) throw new Error("class must be there");

      const subjects = await Subject.find({ class_id });
      if (!subjects) throw new Error("subjects not found");

      return res.json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      next(error);
    }
  }

  static async fetchAttendanceSummary(req, res, next) {
    try {
      const {
        class_id,
        subject_id,
        from_date,
        to_date,
        page = 1, // Default to page 1
        limit = 10, // Default to 10 results per page
      } = req.query;

      if (!class_id) {
        return res
          .status(400)
          .json({ success: false, message: "class_id is required." });
      }

      const isAllSubjects =
        subject_id?.toString().toLowerCase() === "all" || !subject_id;
      const classObjectId = new mongoose.Types.ObjectId(class_id as string);
      const limitInt = parseInt(limit as string, 10);
      const skipInt = (parseInt(page as string, 10) - 1) * limitInt;

      // 1. Initial Match Filter for Class and Date Range
      const matchFilter: any = {
        class_id: classObjectId,
      };

      // Filter by subject if a specific subject is selected
      if (!isAllSubjects) {
        matchFilter.subject_id = new mongoose.Types.ObjectId(
          subject_id as string
        );
      }

      // Date Range Filter (Ensuring correct Date object creation)
      if (from_date || to_date) {
        matchFilter.date = {};

        if (from_date) {
          // Set to beginning of the day (00:00:00.000) for inclusive start
          const startDateObj = new Date(from_date as string);
          startDateObj.setHours(0, 0, 0, 0);
          matchFilter.date.$gte = startDateObj;
        }

        if (to_date) {
          // Set to end of the day (23:59:59.999) for inclusive end
          const endDateObj = new Date(to_date as string);
          endDateObj.setHours(23, 59, 59, 999);
          matchFilter.date.$lte = endDateObj;
        }
      }

      // 2. Get Total Count for Pagination (Count unique students)
      const countPipeline: any[] = [
        { $match: matchFilter },
        { $group: { _id: "$student_id" } }, // Group by student_id to count unique students
        { $count: "totalDocuments" },
      ];

      const countResult = await Attendance.aggregate(countPipeline);
      const totalDocuments =
        countResult.length > 0 ? countResult[0].totalDocuments : 0;
      const totalPages = Math.ceil(totalDocuments / limitInt);

      // 3. Main Aggregation Pipeline
      const summaryPipeline: any[] = [
        // Stage 1: Filter attendance records
        { $match: matchFilter },

        // Stage 2: Group by student_id and subject_id for attendance counts
        {
          $group: {
            _id: { student_id: "$student_id", subject_id: "$subject_id" },
            total_classes_attended: { $sum: 1 },
            present_classes: {
              $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
            },
          },
        },

        // Stage 3: Lookup to get Subject Name
        {
          $lookup: {
            from: "subjects", // Subject collection name
            localField: "_id.subject_id",
            foreignField: "_id",
            as: "subject",
          },
        },
        { $unwind: "$subject" },
        { $addFields: { subject_name: "$subject.name" } },
        { $project: { subject: 0 } },

        // Stage 4: Re-Group by student_id for overall summary
        {
          $group: {
            _id: "$_id.student_id",
            total_classes: { $sum: "$total_classes_attended" },
            attended_classes: { $sum: "$present_classes" },
            subjects_summary: {
              $push: {
                subject_id: "$_id.subject_id",
                subject_name: "$subject_name",
                total_classes: "$total_classes_attended",
                attended_classes: "$present_classes",
              },
            },
            // Capture the specific subject name for non-all queries
            specific_subject_name: {
              $first: { $cond: [isAllSubjects, "$$REMOVE", "$subject_name"] },
            },
          },
        },

        // Stage 5: Calculate Percentage
        {
          $addFields: {
            attendance_percentage: {
              $cond: [
                { $eq: ["$total_classes", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$attended_classes", "$total_classes"] },
                    100,
                  ],
                },
              ],
            },
          },
        },

        // Stage 6: Lookup Student Details (for rollNo and user_id)
        {
          $lookup: {
            from: "students", // Student collection name
            localField: "_id",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: "$student" },

        // Stage 7: Lookup User Details (for name)
        {
          $lookup: {
            from: "users", // User collection name
            localField: "student.user_id", // Assumes student document has user_id
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" }, // Assumes every student has a user record

        // Stage 8: Extract Name and Roll No
        {
          $addFields: {
            student_name: "$user.name",
            student_rollNo: "$student.rollNo",
          },
        },

        // Stage 9: Sort and Pagination
        { $sort: { student_rollNo: 1 } },
        { $skip: skipInt },
        { $limit: limitInt },

        // Stage 10: Final Projection
        {
          $project: {
            _id: 0,
            student_id: "$_id",
            student_name: 1,
            student_rollNo: 1,
            total_classes: 1,
            attended_classes: 1,
            attendance_percentage: { $round: ["$attendance_percentage", 2] },
            // Include subject_name at top-level for specific subject query
            subject_name: {
              $cond: [isAllSubjects, "$$REMOVE", "$specific_subject_name"],
            },
            subjects_summary: {
              // Include subject breakdown array for 'all subjects' query
              $cond: [isAllSubjects, "$subjects_summary", "$$REMOVE"],
            },
          },
        },
      ];

      const summaries = await Attendance.aggregate(summaryPipeline);

      if (!summaries || summaries.length === 0) {
        return res
          .status(404)
          .json({
            success: false,
            message: "No attendance summary found in the specified range.",
          });
      }

      return res.json({
        success: true,
        page: parseInt(page as string, 10),
        limit: limitInt,
        totalPages: totalPages,
        totalResults: totalDocuments,
        data: summaries,
      });
    } catch (error) {
      next(error);
    }
  }

  static async fetchAllClasses(req, res, next) {
    try {
      const pipeline = [
        {
          $lookup: {
            from: "departments", // collection name in MongoDB (lowercase + plural usually)
            localField: "department_id",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: "$department" },
      ];

      const result = await Class.aggregate(pipeline);
      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
