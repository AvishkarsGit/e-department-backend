import mongoose from "mongoose";
import { model } from "mongoose";

const facultySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },

  faculty_role: {
    type: String,
    enum: ["class_teacher", "exam_incharge", "faculty"],
    default: "faculty",
  },
});
export default model("Faculty", facultySchema);
