import mongoose from "mongoose";
import { model } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  photo: { type: String, required: true },
  role: { type: String, enum: ["HOD", "Faculty", "Student"], required: true },
  email_verified: { type: String, required: true, default: false },
  verification_token: { type: String, required: true },
  verification_token_time: { type: Date, required: true, default: Date.now() },
  reset_password_verification_token: { type: String, required: true, default:' ' },
  reset_password_verification_token_time: { type: Date, required: true, default: Date.now() },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
});

export default model("users", userSchema);
