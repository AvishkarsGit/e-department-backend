import Department from "../models/Department";

export class DepartmentController {
  //Create Department
  static async createDepartment(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) throw new Error("name is required!");
      const data = await new Department({ name }).save();
      res.status(201).json({
        success: true,
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  //Read Data
  static async getDepartments(req, res, next) {
    let per_page = parseInt(req.query.size) || 5;
    let current_page = parseInt(req.query.page) || 1;

    try {
      // Filter handling
      const filter = req.query.filter || "";
      let query = {};

      if (filter) {
        const regex = new RegExp(filter, "i"); // case-insensitive
        query = {
          $or: [{ name: regex }, { code: regex }, { description: regex }],
        };
      }

      // Total departments count (after filtering)
      const departments_count = await Department.countDocuments(query);
      const total_pages = Math.ceil(departments_count / per_page);

      // Handle page out of range
      if (total_pages === 0) current_page = 1;
      else if (current_page > total_pages) current_page = 1;

      // Fetch paginated data
      const departments = await Department.find(query)
        .skip((current_page - 1) * per_page)
        .limit(per_page)
        .sort({ name: 1 }); // Optional: sort alphabetically

      // Response
      return res.json({
        success: true,
        data: departments,
        pagination: {
          current_page,
          prev_page: current_page > 1 ? current_page - 1 : null,
          next_page: current_page < total_pages ? current_page + 1 : null,
          total: departments_count,
          total_pages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  //Update Department
  static async updateDepartment(req, res, next) {
    try {
      const  id  = req.query.id || req.params.id;
      const { name } = req.body;
      const updatedData = await Department.findByIdAndUpdate(
        id,
        { name: name },
        { new: true }
      );
      if (!updatedData) {
        return res.json({ success: false, message: "Department is not found" });
      }
      return res.json({
        success: true,
        data: updatedData,
      });
    } catch (error) {
      next(error);
    }
  }

  //Delete  Department

  static async deleteDepartment(req, res, next) {
    try {
      const id = req.query.id || req.params.id;
      const deletedDepartment = await Department.findByIdAndDelete(id);
      if (!deletedDepartment) {
        return res.json({ success: false, message: "Department is not found" });
      }
      res.json({ success: true, message: "Department Deleted Successfully" });
    } catch (error) {
      next(error);
    }
  }
}
