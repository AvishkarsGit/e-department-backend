import StudyMaterial from "../models/StudyMaterial";
import { Cloudinary } from "../utils/Cloudinary";
import * as fs from "fs";

export class StudyMaterialController {
  // creating Operations
  static async createStudyMaterial(req, res, next) {
    try {
      const { title, subject_id, class_id, faculty_id } = req.body;
      let attachment;
      let public_id;

      if (req.file) {
        const result = await Cloudinary.uploadStudyMaterial(req.file.path);
        if (!result) throw new Error('Failed to upload the file');
        attachment = result?.secure_url;
        public_id = result?.public_id;
      }

      const data = {
        title,
        subject_id,
        class_id,
        faculty_id,
        cloud_public_id: public_id,
        attachment
      }

      const studymaterialdata = await new StudyMaterial(data).save();
      res.json({
        success: true,
        data: studymaterialdata
      });
    } catch (error) {
      throw error;
    }
  }

  // read opertion
  static async getStudyMaterial(req, res, next) {
    let per_page = parseInt(req.query.size) || 5;
    let current_page = parseInt(req.query.page) || 1;

    try {
      const filter = req.query.filter || "";
      let query = {};

      if (filter) {
        const regex = new RegExp(filter, "i");
        query = {
          $or: [{ name: regex }, { code: regex }, { description: regex }],
        };
      }

      // Total departments count (after filtering)
      const studyMaterialCount = await StudyMaterial.countDocuments(query);
      const total_pages = Math.ceil(studyMaterialCount / per_page);

      // Handle page out of range
      if (total_pages === 0) current_page = 1;
      else if (current_page > total_pages) current_page = 1;

      // Fetch paginated data
      const StudyMaterialdata = await StudyMaterial.find(query)
        .skip((current_page - 1) * per_page)
        .limit(per_page)
        .sort({ name: 1 });

      // Response
      return res.json({
        success: true,
        data: StudyMaterialdata,
        pagination: {
          current_page,
          prev_page: current_page > 1 ? current_page - 1 : null,
          next_page: current_page < total_pages ? current_page + 1 : null,
          total: studyMaterialCount,
          total_pages,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  //update Operation
  static async updateStudyMaterial(req, res, next) {
    try {
      const { id } = req.params || req.body;
      const { title, subject_id, class_id, faculty_id } = req.body;

      const findData = await StudyMaterial.findById(id);
      if (!findData) {
        return res.status(400).json({
          success: false,
          message: "Study material is not found"
        });
      }

      let attachment = findData.attachment;
      let public_id = findData.cloud_public_id;

      if (req.file) {
        if (public_id) {
          await Cloudinary.deleteFromCloud(public_id);
        }

        const result = await Cloudinary.uploadStudyMaterial(req.file.path);
        attachment = result.secure_url;
        public_id = result.public_id;


        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }

      const updatedData = {
        title: title ?? findData.title,
        subject_id: subject_id ?? findData.subject_id,
        class_id: class_id ?? findData.class_id,
        faculty_id: faculty_id ?? findData.faculty_id,
        attachment,
        cloud_public_id: public_id,
      };

      const updatedDataMaterial = await StudyMaterial.findByIdAndUpdate(id, updatedData, { new: true });

      res.json({
        success: true,
        data: updatedDataMaterial
      });

    } catch (error) {
      throw error;
    }
  }

  //delete Operation
  static async deleteStudyMaterial(req, res, next) {
    try {
      const { id } = req.params || req.body;
      const material = await StudyMaterial.findById(id);
      if (!material) {
        return res.status(404).json({ success: false, message: "Study Material not found" });
      }

      if (material.cloud_public_id) {
        await Cloudinary.deleteFromCloud(material.cloud_public_id);
      }

      await StudyMaterial.findByIdAndDelete(id);

      res.json({
        success: true,
        message: "Study Material deleted successfully",
      });

    } catch (error) {
      throw error;
    }
  }

}