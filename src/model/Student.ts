import mongoose from "mongoose";
import { model } from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Department",
  },

  year: {
    type: Number,
    required: true,
  },

  semester: {
    type: Number,
    required: true,
  },

  
});
