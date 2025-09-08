import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
export class Cloudinary {
  static async uploadToCloud(filePath: string) {
    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
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
}
