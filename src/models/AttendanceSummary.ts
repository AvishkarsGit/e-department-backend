import mongoose, { model } from "mongoose";

const attendanceSummarySchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
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
    total_classes: { type: Number, default: 0 },
    attended_classes: { type: Number, default: 0 },
    attendance_percentage: { type: Number, default: 0 },
    last_updated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
attendanceSummarySchema.index(
  { student_id: 1, subject_id: 1 },
  { unique: true }
); // prevent duplicates
attendanceSummarySchema.index({ class_id: 1, subject_id: 1 }); // Query #4
attendanceSummarySchema.index({ class_id: 1, student_id: 1 }); // Query #2 & #3 (all subjects in class)
attendanceSummarySchema.index({ student_id: 1 }); // Query #5 (all subjects for a student)

export default model("AttendanceSummary", attendanceSummarySchema);
