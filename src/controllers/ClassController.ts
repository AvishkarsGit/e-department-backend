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
      // pagination params
      const per_page = parseInt(req.query.size) || 5; // number of records per page
      const current_page = parseInt(req.query.page) || 1; // current page
      const skip = (current_page - 1) * per_page;

      const dep = await Department.find();

      // total documents count
      const total = await Class.countDocuments();

      // get classes with department populated
      const classes = await Class.find()
        .populate("department_id") // only populate department name
        .skip(skip)
        .limit(per_page);

      if (!classes) {
        throw new Error("Failed to load classes");
      }

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
      const id = req.query.id;
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
      const id = req.query.id;
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
