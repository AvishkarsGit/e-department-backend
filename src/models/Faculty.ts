import mongoose from "mongoose";
import { model } from "mongoose";



const facultySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    // assigned_class: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Class"
    // },
    // subjects: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Class"
    //     }
    // ],
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