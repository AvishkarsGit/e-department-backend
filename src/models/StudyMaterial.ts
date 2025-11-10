import mongoose from "mongoose";
import { model } from "mongoose";
import Faculty from "./Faculty";

const StudymaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    attachment: {
        type: String,
        require: true
    },
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
    },
    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    },
    cloud_public_id: {
        type: String,
        required: false,
    },
    faculty_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty"
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }

})

export default model("Studymaterial", StudymaterialSchema);
