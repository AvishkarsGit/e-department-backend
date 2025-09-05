import Department from "../models/Department";
import Class from "../models/Class";

export class ClassController {
  static async addClass(req, res, next) {
    try {
      const { department_id, year, semester } = req.body;

      const class_data = await new Class({
        department_id,
        year,
        semester,
      }).save();

      if (!class_data) {
        throw new Error("failed to create class");
      }

      return res.json({
        success: true,
        data: class_data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getClasses(req, res, next) {
    try {
      const per_page = parseInt(req.query.size) || 5;
      const current_page = parseInt(req.query.page) || 1;
      const skip = (current_page - 1) * per_page;

      const filter = req.query.filter || "";
      const regex = filter ? new RegExp(filter, "i") : null;

      const matchStage = regex ? { "department.name": regex } : {};

      // Pipeline
      const pipeline = [
        {
          $lookup: {
            from: "departments", // collection name in MongoDB (lowercase + plural usually)
            localField: "department_id",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: "$department" },
        { $match: matchStage },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: per_page }],
          },
        },
      ];

      const result = await Class.aggregate(pipeline);

      const total = result[0].metadata[0]?.total || 0;
      const classes = result[0].data;

      return res.json({
        success: true,
        data: classes,
        pagination: {
          total,
          per_page,
          current_page,
          total_pages: Math.ceil(total / per_page),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateClass(req, res, next) {
    try {
      const id = req.params.id;
      const { department_id, year, semester } = req.body;
      if (!id) {
        throw new Error("ID is not available");
      }

      const isUpdated = await Class.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            updated_at: Date.now(),
            department_id,
            year,
            semester,
          },
        },
        {
          new: true,
        }
      );

      if (!isUpdated) {
        throw new Error("failed to update");
      }

      return res.json({
        success: true,
        data: isUpdated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteClass(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) throw new Error("id is not available");

      const deleted = await Class.findOneAndDelete({ _id: id });

      if (!deleted) {
        throw new Error("Failed to delete");
      }
      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }
}
