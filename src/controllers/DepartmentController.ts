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
            const AlldepartmentName = await Department.find();
            res.status(201).json({
                success: true,
                Alldata: AlldepartmentName
            })
        }
        catch (error) {
            next(error);
        }
    }
    //Update Department
    static async updateDepartment(req, res, next) {
        try {
            const { id } = req.query;
            // console.log()
            const { name } = req.body;
            const updatedData = await Department.findByIdAndUpdate(
                id,
                { name:name },
                { new: true}
            );
            if (!updatedData) return res.status(404).json({ success: false, message: "Department is not found" });
            res.json({
                success:true,
                data:updatedData
            })
        } catch (error) {
            next(error);
        };
    }

    //Delete  Department

    static async deleteDepartment(req,res,next){
        try{
        const id = req.query.id;
        const deletedDepartment = await Department.findByIdAndDelete(
            id
        );
        if(!deletedDepartment){
            return res.status(403).json({success:false , message:"Department is not found"});
        };
        res.json({success:true,message:"Department Deleted Successfully"});
        }catch(error){
           next(error);
        };
    }
}