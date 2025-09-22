import mongoose from "mongoose";
import { model } from "mongoose";

const facultySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required:true
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
         required:true
    },
    
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject"
        }
    ],
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

export default model("faculty", facultySchema);