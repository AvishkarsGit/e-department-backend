import mongoose from "mongoose";
import { model } from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Class",
    },
    guardian: [
      {
        name: String,
        relation: String,
        phone: String,
      },
    ],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default model("Student", studentSchema);
