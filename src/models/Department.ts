import mongoose from "mongoose";
import { model } from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

export default model("Department", departmentSchema);
