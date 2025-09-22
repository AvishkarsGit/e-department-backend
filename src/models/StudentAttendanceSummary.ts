import mongoose from "mongoose";
import { model } from "mongoose";
//track monthly attendance
const summarySchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    month: {
      type: String,
      required: true,
    },
    total_classes: {
      type: Number,
      required: true,
      default: 0,
    },
    attended_classes: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default model("StudentAttendanceSummary", summarySchema);
