import mongoose from "mongoose";
import { model } from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  },

  {
    toJSON: { virtuals: true }, // include virtuals in JSON
    toObject: { virtuals: true }, // include virtuals in plain objects
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// ✅ Add virtual for department
subjectSchema.virtual("class", {
  ref: "Class",
  localField: "_id",
  foreignField: "_id",
  justOne: true, // since one class belongs to one department
});

export default model("Subject", subjectSchema);
