import mongoose from "mongoose";
import { model } from "mongoose";

const classSchema = new mongoose.Schema({
  department_id: {
    // type: String,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
});

export default model("Class", classSchema);
