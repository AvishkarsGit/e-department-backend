import Class from "../models/Class";
import Subject from "../models/Subject";

export class SubjectController {
  static async addSubject(req, res, next) {
    try {
      const { name, code, class_id } = req.body;
      const subject = await new Subject({
        name,
        code,
        class_id,
      }).save();

      if (!subject) {
        throw new Error("failed to add subject");
      }

      const classData = await Class.findOne({ _id: class_id })
        .populate("department_id")
        .lean();
      if (!classData) {
        throw new Error("class not found");
      }
      // 4️⃣ Rename populated field for cleaner structure
      const classDataObj = classData as any;
      classDataObj.department = classDataObj.department_id;
      delete classData.department_id;
      return res.json({
        success: true,
        data: { subject, classData: classDataObj },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllSubjects(req, res, next) {
    try {
      const per_page = parseInt(req.query.size) || 5;
      const current_page = parseInt(req.query.page) || 1;
      const skip = (current_page - 1) * per_page;

      const filter = req.query.filter || "";
      const regex = filter ? new RegExp(filter, "i") : null;

      const matchStage = regex
        ? {
            $or: [
              { name: regex }, // ✅ subject name
              { code: regex }, // ✅ subject code
            ],
          }
        : {};

      const pipeline = [
        {
          $lookup: {
            from: "classes",
            localField: "class_id",
            foreignField: "_id",
            as: "class",
          },
        },
        { $unwind: "$class" },
        {
          $lookup: {
            from: "departments",
            localField: "class.department_id",
            foreignField: "_id",
            as: "class.department",
          },
        },
        { $unwind: "$class.department" },
        { $match: matchStage },
        {
          $project: {
            _id: 1,
            name: 1,
            code: 1,
            classData: "$class", // 👈 Rename here
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: per_page }],
          },
        },
      ];

      const result = await Subject.aggregate(pipeline);

      const total = result[0].metadata[0]?.total || 0;
      const subjects = result[0].data;

      return res.json({
        success: true,
        data: subjects,
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
  static async getAllSubjectsWithoutPagination(req, res, next) {
    try {
      const subjects = await Subject.find({});
      if (!subjects) {
        throw new Error("subjects not found");
      }
      return res.json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSubject(req, res, next) {
    try {
      const id = req.query.id || req.params.id;
      if (!id) {
        throw new Error("id is not available");
      }

      const subject = await Subject.findOne({ _id: id });
      if (!subject) {
        throw new Error("subject not found");
      }

      return res.json({
        success: true,
        data: subject,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSubject(req, res, next) {
    try {
      const id = req.query.id || req.params.id;
      if (!id) {
        throw new Error("id is not available");
      }

      const { name, code, class_id } = req.body;
      const updatedData = await Subject.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            code,
            class_id,
          },
        },
        {
          new: true,
        }
      );

      if (!updatedData) {
        throw new Error("failed to update data");
      }

      const classData = await Class.findOne({ _id: updatedData?.class_id })
        .populate("department_id")
        .lean();
      if (!classData) {
        throw new Error("class not found");
      }
      // 4️⃣ Rename populated field for cleaner structure
      const classDataObj = classData as any;
      classDataObj.department = classDataObj.department_id;
      delete classData.department_id;

      return res.json({
        success: true,
        data: { subject: updatedData, classData: classDataObj },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubject(req, res, next) {
    try {
      const id = req.query.id || req.params.id;
      if (!id) {
        throw new Error("id is not available");
      }

      const isDeleted = await Subject.findOneAndDelete({
        _id: id,
      });

      if (!isDeleted) {
        throw new Error("failed to delete data");
      }

      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  static async fetchClassId(req, res, next) {
    try {
      if (!req.classId) {
        throw new Error("class not found");
      }
      return res.json({
        success: true,
        data: req.classId,
      });
    } catch (error) {
      next(error);
    }
  }
}
