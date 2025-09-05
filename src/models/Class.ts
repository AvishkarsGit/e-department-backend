import mongoose from "mongoose";
import { model } from "mongoose";

const classSchema = new mongoose.Schema(
  {
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    year: { type: Number, required: true },
    semester: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true }, // include virtuals when sending as JSON
    toObject: { virtuals: true }, // include virtuals when calling .toObject()
  }
);

// ✅ Add virtual for department
classSchema.virtual("department", {
  ref: "Department",
  localField: "department_id",
  foreignField: "_id",
  justOne: true, // since one class belongs to one department
});

export default model("Class", classSchema);
