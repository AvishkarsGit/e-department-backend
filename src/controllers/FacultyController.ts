import Faculty from "../models/Faculty";
import Department from "../models/Department";
import Class from "../models/Class";


export class FacultyController {
    //creating the faculty
    static async createFaculty(req, res, next) {
        try {
            const {
                user_id,
                department_id,
                // assigned_class,
                // subjects,
            } = req.body;
            const facultyData = await new Faculty({
                user_id,
                department_id,
                // assigned_class,
                // subjects
            }).save();

            if (!facultyData) return res.json({ success: "false" });
            
            res.json({
                success:true,
                data:facultyData
            })

        } catch (error) {
            next(error)
        }
    }

    //read the faculty
    static async getFaculty(req, res, next) {
        try {
            const facultyData = await Faculty.find()
            .populate("user_id")
            .populate("department_id")
            res.json({
                success: "true",
                data: facultyData
            })

        } catch (error) {
            next(error)
        }
    }

    //delete faculty

    static async deleteFaculty(req, res, next) {
        try {
            const id = req.query.id;
            const deleteData = await Faculty.findOneAndDelete(
                id
            );
            res.json({
                success: true,
                deleteData: deleteData
            })
        } catch (error) {
            throw error
        }
    }

    //Update Faculty

    static async updateFaculty(req,res,next){
        try{
        const id = req.query.id;
        const { 
            user_id,
            department_id
         } = req.body;
        const updatedData = await Faculty.findByIdAndUpdate(
            id,
            {
            user_id:user_id,
            department_id:department_id
            },
            {
                new:true
            }
        );

        res.json({
            success:true,
            data:updatedData,
            message:"data Updated Successfully"
        })
        }catch(error){
         next(error);
        }
    }

}

