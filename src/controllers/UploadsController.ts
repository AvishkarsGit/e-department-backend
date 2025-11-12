import Subject from "../models/Subject";
import Uploads from "../models/Uploads";
import { Cloudinary } from "../utils/Cloudinary";

export class UploadsController {
  static async uploadMaterial(req, res, next) {
    try {
      const user = req.user;
      const { title, upload_type, subject_id } = req.body;

      let secure_url, public_id;

      if (req.file) {
        const result = await Cloudinary.uploadToCloud(
          req.file.path,
          "material"
        );
        //get url and public id
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
      let per_page = parseInt(req.query.size) || 5;
      let current_page = parseInt(req.query.page) || 1;

      // Filter handling
      const filter = req.query.filter || "";
      let query: any = {};
      if (filter) {
        const regex = new RegExp(filter, "i");
        query = {
          $or: [{ title: regex }, { subject: regex }],
        };
      }

      // Total documents after filter
      const uploads_doc_count = await Uploads.countDocuments(query);
      const total_pages = Math.ceil(uploads_doc_count / per_page);

      // Adjust current_page if out of range
      if (total_pages === 0) current_page = 1;
      else if (current_page > total_pages) current_page = 1;

      // Fetch paginated data
      const uploads = await Uploads.find(query)
        .populate({
          path: "uploaded_by",
          select: "name",
        })
        .populate({
          path: "subject_id",
          select: "name",
        })
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
}
