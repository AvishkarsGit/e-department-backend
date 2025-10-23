import mongoose from "mongoose";
import { model } from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    report_url: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
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

export default model("Report", reportSchema);
