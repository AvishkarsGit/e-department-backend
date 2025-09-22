import mongoose from "mongoose";
import { model } from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },

    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    period_number: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default model("Attendance", attendanceSchema);
