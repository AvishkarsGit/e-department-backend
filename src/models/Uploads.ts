import mongoose from "mongoose";
import { model } from "mongoose";

const uploadsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    upload_type: {
      type: String,
      required: true,
      enum: [
        "lab_manual",
        "notice",
        "assignment",
        "time_table",
        "syllabus",
        "other",
      ],
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Subject",
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Class",
    },
    uploaded_url: {
      type: String,
      required: true,
    },
    cloud_public_id: {
      type: String,
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

export default model("Uploads", uploadsSchema);
