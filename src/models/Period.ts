import mongoose from "mongoose";
import { model } from "mongoose";

const periodSchema = new mongoose.Schema(
  {
    period_text: {
      type: String,
      required: true,
    },
    period: {
      type: Number,
      required: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    ending_time: {
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
export default model("Period", periodSchema);
