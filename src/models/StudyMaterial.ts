import mongoose from "mongoose";
import { model } from "mongoose";

const StudyMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    attachment: {
        type: String,
        required: true
    },
    attachment_type: {
        type: String,
        required: true,
        enum: ['lab_manual', 'assignment', 'notice', 'timetable', 'notes', 'syllabus', 'other'],
        lowercase: true
    },
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
        index: true
    },
    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
        index: true
    },
    cloud_public_id: {
        type: String,
        required: false
    },
    faculty_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
StudyMaterialSchema.index({ class_id: 1, subject_id: 1, attachment_type: 1 });
StudyMaterialSchema.index({ faculty_id: 1, createdAt: -1 });
StudyMaterialSchema.index({ title: 'text' });

export default model("StudyMaterial", StudyMaterialSchema);
