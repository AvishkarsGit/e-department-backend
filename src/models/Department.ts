import { timeStamp } from "console";
import mongoose from "mongoose";
import { model } from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
});

export default model("Department", departmentSchema);
