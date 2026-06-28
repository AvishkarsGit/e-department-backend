import mongoose, { model } from "mongoose";

const classSessionSchema = new mongoose.Schema(
  {
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
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    period: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Period",
      required: true,
    },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

// ✅ Optimized Indexes
classSessionSchema.index({ class_id: 1, subject_id: 1, date: 1 }); // most common lookup
classSessionSchema.index({ class_id: 1, date: 1 }); // recent sessions for class
classSessionSchema.index({ subject_id: 1, date: -1 }); // per-subject recent sessions

export default model("ClassSession", classSessionSchema);
