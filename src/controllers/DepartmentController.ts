import Department from "../models/Department";

export class DepartmentController {
    //Create Department
    static async createDepartment(req, res, next) {
        try {
            const { name } = req.body;
            const data = await new Department({ name }).save();
            res.status(201).json({
                success: true,
                data: data
            })

        }
        catch (error) {
            next(error);
        }
    }

    //Read Data
    static async readDepartment(req, res, next) {
        try {

            const per_page = parseInt(req.query.size) || 5;
            const current_page = parseInt(req.query.page) || 1;
            const skip = (current_page - 1) * per_page;
           

            const filter = req.query.filter || "";
            let query = {};
            
            if (filter) {
                const regex = new RegExp(filter, 'i');
                query = {
                    name: regex
                }
            }
            
            const total = await Department.countDocuments(query);
            const departments = await Department.find(query).skip(skip).limit(per_page);
            if (!departments) throw new Error('no more Departments');
            return res.json({
                success: true,
                data: departments,
                pagination: {
                    total,
                    current_page,
                    per_page,
                    total_pages: Math.ceil(total / per_page)
                }
            })
        }
        catch (error) {
            next(error);
        }
    }
    //Update Department
    static async updateDepartment(req, res, next) {
        try {
            const id = req.params.id;
            // console.log()
            const { name } = req.body;
            const updatedData = await Department.findByIdAndUpdate(
                id,
                { name: name },
                { new: true }
            );
            if (!updatedData) return res.status(404).json({ success: false, message: "Department is not found" });
            res.json({
                success: true,
                data: updatedData
            })
        } catch (error) {
            next(error);
        };
    }

    //Delete  Department

    static async deleteDepartment(req, res, next) {
        try {
            const id = req.params.id;
            const deletedDepartment = await Department.findByIdAndDelete(
                id
            );
            if (!deletedDepartment) {
                return res.status(403).json({ success: false, message: "Department is not found" });
            };
            res.json({ success: true, message: "Department Deleted Successfully" });
        } catch (error) {
            next(error);
        };
    }
}