import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
export class Cloudinary {
  static async uploadToCloud(filePath: string) {
    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
        folder: "users",
      });
      if (uploadResult) {
        //successfully upload file to cloudinary, unlink/delete the local files
        fs.unlinkSync(filePath);
      }
      return uploadResult;
    } catch (error) {
      throw error;
    }
  }

  static async deleteFromCloud(public_id: string) {
    try {
      const result = await cloudinary.uploader.destroy(public_id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async uploadExcelToCloud(file: string) {
    try {
      const response = await cloudinary.uploader.upload(file, {
        resource_type: "raw",
        folder: "attendance_reports",
      });

     fs.unlinkSync(file);

      return response;
    } catch (error) {
      throw error;
    }
  }

  static async uploadStudyMaterial(filePath:any){
    try{
    const StudyMaterial = await cloudinary.uploader.upload(filePath,{
      resource_type:"auto",
      folder:"StudyMaterial"
    })

    fs.unlinkSync(filePath);
    return StudyMaterial;
    }catch (error) {
      throw error;
    }
  }
}
