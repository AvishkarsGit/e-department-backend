import Student from "../models/Student";
import Subject from "../models/Subject";
import Uploads from "../models/Uploads";
import { AWS } from "../utils/AWS";
import fs from "fs";


export class UploadsController {
  static async uploadMaterial(req, res, next) {
    try {
      const user = req.user;
      const { title, upload_type, subject_id } = req.body;

      let secure_url, public_id;

      if (req.file) {
        const result = await AWS.uploadToS3(req.file.path, "material");

        secure_url = result?.secure_url;
        public_id = result?.public_id;
      }

      //find class id
      const subject = await Subject.findOne({ _id: subject_id }).select(
        "class_id"
      );
      if (!subject) throw new Error("subject id invalid");

      const uploadedData = {
        title,
        upload_type,
        subject_id,
        uploaded_by: user.id,
        class_id: subject?.class_id,
        uploaded_url: secure_url,
        cloud_public_id: public_id,
      };

      const upload = await new Uploads(uploadedData).save();
      if (!upload) throw new Error("failed to upload");

      return res.json({
        success: true,
        data: upload,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllMaterial(req, res, next) {
    try {
      const user = req.user;
      const role = user.role;

      let per_page = parseInt(req.query.size) || 5;
      let current_page = parseInt(req.query.page) || 1;

      const filter = req.query.filter || "";
      let query: any = {};

      // ------------------------------------------
      // 1️⃣ LIMIT MATERIALS IF USER IS A STUDENT
      // ------------------------------------------
      let allowedSubjectIds = [];

      if (role === "student") {
        const student = await Student.findOne({ user_id: user.id }).select(
          "class_id"
        );

        if (!student) {
          return res.status(400).json({
            success: false,
            message: "Student record not found",
          });
        }

        // Fetch subjects that belong to this student's class
        const subjects = await Subject.find({
          class_id: student.class_id,
        }).select("_id");

        allowedSubjectIds = subjects.map((s) => s._id);

        // Restrict query
        query.subject_id = { $in: allowedSubjectIds };
      }

      // ------------------------------------------
      // 2️⃣ APPLY SEARCH FILTER
      // ------------------------------------------
      if (filter) {
        const regex = new RegExp(filter, "i");

        // find subjects by name that match the filter
        const matchedSubjects = await Subject.find({ name: regex }).select(
          "_id"
        );
        const matchedSubjectIds = matchedSubjects.map((s) => s._id);

        // If student → only include matched subjects within allowed subjects
        let finalSubjectIds = matchedSubjectIds;

        if (role === "student") {
          finalSubjectIds = matchedSubjectIds.filter((id) =>
            allowedSubjectIds.map((x) => x.toString()).includes(id.toString())
          );
        }

        query.$or = [
          { title: regex },
          { upload_type: regex },
          { subject_id: { $in: finalSubjectIds } },
        ];
      }

      // ------------------------------------------
      // 3️⃣ PAGINATION + FETCH
      // ------------------------------------------
      const uploads_doc_count = await Uploads.countDocuments(query);
      const total_pages = Math.ceil(uploads_doc_count / per_page);

      if (total_pages === 0) current_page = 1;
      else if (current_page > total_pages) current_page = 1;

      const uploads = await Uploads.find(query)
        .populate({ path: "uploaded_by", select: "name" })
        .populate({ path: "subject_id", select: "name class_id" })
        .skip((current_page - 1) * per_page)
        .limit(per_page);

      return res.json({
        success: true,
        data: uploads,
        pagination: {
          current_page,
          prev_page: current_page > 1 ? current_page - 1 : null,
          next_page: current_page < total_pages ? current_page + 1 : null,
          total: uploads_doc_count,
          total_pages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMaterial(req, res, next) {
    try {
      const id = req.query.id || req.params.id;
      const { title, upload_type, subject_id } = req.body;
      //current user
      const currentUser = req.user;

      //find material from db
      const material = await Uploads.findOne({ _id: id });
      if (!material) throw new Error("material not found");

      //previous data
      let secure_url = material.uploaded_url;
      let public_id = material.cloud_public_id;

      if (req.file) {
        console.log("file", req.file);
        //delete previous file from db
        const isDeleted = await AWS.deleteFromS3(public_id);
        if (!isDeleted) throw new Error("failed to delete previous file");

        //upload new file
        const result = await AWS.uploadToS3(req.file.path, "material");

        //get url and public id
        secure_url = result?.secure_url;
        public_id = result?.public_id;

        console.log("new url:", secure_url);
        console.log("new public id:", public_id);
      }

      //update data to db
      const updated = await Uploads.findOneAndUpdate(
        {
          _id: material._id,
        },
        {
          $set: {
            title,
            upload_type,
            subject_id,
            uploaded_url: secure_url,
            cloud_public_id: public_id,
            uploaded_by: currentUser.id,
          },
        },
        {
          new: true,
        }
      );

      if (!updated) throw new Error("failed to update data");

      return res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteMaterial(req, res, next) {
    try {
      const id = req.query.id || req.params.id;
      const material = await Uploads.findOne({ _id: id });
      if (!material) throw new Error("material not found");

      const public_id = material.cloud_public_id;
      const isDeleted = await AWS.deleteFromS3(public_id);
      if (!isDeleted) throw new Error("failed to delete data");

      const deleted = await Uploads.findOneAndDelete({ _id: material._id });
      if (!deleted) throw new Error("failed to delete data");

      return res.json({
        success: true,
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadFile(req, res, next) {
    try {
      const id = req.query.id || req.params.id;
      const material = await Uploads.findOne({ _id: id });
      if (!material) throw new Error("material not found");

      const downloadUrl = await AWS.getDownloadUrl(material?.cloud_public_id);
      if (!downloadUrl) throw new Error("failed to get download url");
      return res.json({
        success: true,
        data: downloadUrl,
      });
    } catch (error) {
      next(error);
    }
  }
}
