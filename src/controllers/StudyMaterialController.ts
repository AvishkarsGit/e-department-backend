import StudyMaterial from "../models/StudyMaterial";
import { Cloudinary } from "../utils/Cloudinary";
import mongoose from "mongoose";
import * as fs from "fs";

export class StudyMaterialController {
  // creating Operations
  static async createStudyMaterial(req, res, next) {
    try {
      const { title, attachment_type, subject_id, class_id, faculty_id } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Attachment file is required"
        });
      }

      const result = await Cloudinary.uploadStudyMaterial(req.file.path);
      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload file"
        });
      }

      const studyMaterialData = await StudyMaterial.create({
        title: title.trim(),
        attachment_type: attachment_type.toLowerCase(),
        subject_id: new mongoose.Types.ObjectId(subject_id),
        class_id: new mongoose.Types.ObjectId(class_id),
        faculty_id: new mongoose.Types.ObjectId(faculty_id),
        attachment: result.secure_url,
        cloud_public_id: result.public_id
      });

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(201).json({
        success: true,
        data: studyMaterialData
      });
    } catch (error) {
      next(error);
    }
  }

  // read operation
  static async getStudyMaterial(req, res, next) {
    try {
      const {
        page = 1,
        size = 10,
        class_id,
        subject_id,
        attachment_type,
        search,
        faculty_id
      } = req.query;

      const per_page = Math.min(parseInt(size), 100);
      const current_page = Math.max(parseInt(page), 1);
      const skip = (current_page - 1) * per_page;

      const query:any = {};
      if (class_id) query.class_id = new mongoose.Types.ObjectId(class_id);
      if (subject_id) query.subject_id = new mongoose.Types.ObjectId(subject_id);
      if (attachment_type) query.attachment_type = attachment_type.toLowerCase();
      if (faculty_id) query.faculty_id = new mongoose.Types.ObjectId(faculty_id);

      if (search) {
        query.$text = { $search: search };
      }

      const [studyMaterials, totalCount] = await Promise.all([
        StudyMaterial.find(query)
          .populate('subject_id', 'name code')
          .populate('class_id', 'year semester')
          .populate('faculty_id', 'name')
          .select('-cloud_public_id')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(per_page)
          .lean(),
        StudyMaterial.countDocuments(query)
      ]);

      const total_pages = Math.ceil(totalCount / per_page);

      res.json({
        success: true,
        data: studyMaterials,
        pagination: {
          current_page,
          per_page,
          total_pages,
          total_count: totalCount,
          has_next: current_page < total_pages,
          has_prev: current_page > 1
        }
      });
    } catch (error) {
      next(error);
    }
  }

  //update Operation
  static async updateStudyMaterial(req, res, next) {
    try {
      const { id } = req.params;
      const { title, attachment_type, subject_id, class_id, faculty_id } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid study material ID"
        });
      }

      const existingMaterial = await StudyMaterial.findById(id);
      if (!existingMaterial) {
        return res.status(404).json({
          success: false,
          message: "Study material not found"
        });
      }

      const updateData:any = {};
      if (title) updateData.title = title.trim();
      if (attachment_type) updateData.attachment_type = attachment_type.toLowerCase();
      if (subject_id) updateData.subject_id = new mongoose.Types.ObjectId(subject_id);
      if (class_id) updateData.class_id = new mongoose.Types.ObjectId(class_id);
      if (faculty_id) updateData.faculty_id = new mongoose.Types.ObjectId(faculty_id);

      if (req.file) {
        if (existingMaterial.cloud_public_id) {
          await Cloudinary.deleteFromCloud(existingMaterial.cloud_public_id);
        }

        const result = await Cloudinary.uploadStudyMaterial(req.file.path);
        if (!result) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload new file"
          });
        }

        updateData.attachment = result.secure_url;
        updateData.cloud_public_id = result.public_id;

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }

      const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('subject_id', 'name code')
       .populate('class_id', 'year semester')
       .populate('faculty_id', 'name');

      res.json({
        success: true,
        data: updatedMaterial
      });
    } catch (error) {
      next(error);
    }
  }

  //delete Operation
  static async deleteStudyMaterial(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid study material ID"
        });
      }

      const material = await StudyMaterial.findById(id);
      if (!material) {
        return res.status(404).json({
          success: false,
          message: "Study material not found"
        });
      }

      if (material.cloud_public_id) {
        await Cloudinary.deleteFromCloud(material.cloud_public_id);
      }

      await StudyMaterial.findByIdAndDelete(id);

      res.json({
        success: true,
        message: "Study material deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByType(req, res, next) {
    try {
      const { attachment_type } = req.params;
      const { class_id, subject_id, page = 1, size = 10 } = req.query;

      const query:any = { attachment_type: attachment_type.toLowerCase() };
      if (class_id) query.class_id = new mongoose.Types.ObjectId(class_id);
      if (subject_id) query.subject_id = new mongoose.Types.ObjectId(subject_id);

      const per_page = Math.min(parseInt(size), 100);
      const skip = (parseInt(page) - 1) * per_page;

      const [materials, totalCount] = await Promise.all([
        StudyMaterial.find(query)
          .populate('subject_id', 'name code')
          .populate('class_id', 'year semester')
          .populate('faculty_id', 'name')
          .select('-cloud_public_id')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(per_page)
          .lean(),
        StudyMaterial.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: materials,
        pagination: {
          current_page: parseInt(page),
          per_page,
          total_pages: Math.ceil(totalCount / per_page),
          total_count: totalCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

}
