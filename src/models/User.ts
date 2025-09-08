import mongoose from "mongoose";
import { model } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  photo: { type: String, required: true, default: null },
  role: {
    type: String,
    enum: ["admin", "hod", "faculty", "student"],
    required: true,
  },
  email_verified: { type: String, required: true, default: false },
  verification_token: { type: String, required: true, default: "000000" },
  verification_token_time: { type: Date, required: true, default: Date.now() },
  reset_password_verification_token: {
    type: String,
    required: true,
    default: "000000",
  },
  reset_password_verification_token_time: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  account_status: {
    type: Boolean,
    required: true,
    default: true,
  },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
});

export default model("users", userSchema);
