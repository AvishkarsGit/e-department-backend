import mongoose, { model } from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSession",
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Compound Indexes
attendanceSchema.index({ class_id: 1, subject_id: 1, date: 1 }); // Query #1 (class+subject+date range)
attendanceSchema.index({ class_id: 1, date: 1 }); // Query #2 (all subjects in class+date)
attendanceSchema.index({ class_id: 1, student_id: 1, date: 1 }); // Query #3 (all subjects till yet, per student/class)
attendanceSchema.index({ student_id: 1, subject_id: 1, date: -1 }); // Query #5 (student+subject, recent first)
attendanceSchema.index({ session_id: 1, student_id: 1 }, { unique: true }); // prevent duplicates

export default model("Attendance", attendanceSchema);
