import * as mongoose from "mongoose";
import { model } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    guardianPhone: {
      type: String,
      required: true,
    },
    email_verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    verification_token: {
      type: String,
      required: true,
    },
    verification_token_time: {
      type: Date,
      required: true,
    },
    reset_password_verification_token: {
      type: String,
      required: true,
    },
    reset_password_verification_token_time: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("users", userSchema);
