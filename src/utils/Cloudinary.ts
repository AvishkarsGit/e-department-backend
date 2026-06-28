import { v2 as cloudinary } from "cloudinary";
import * as axiosImport from "axios";
const axios = axiosImport.default;
import * as fs from "fs";
import path from "path";
export class Cloudinary {
  static async uploadToCloud(filePath: string, folder = "users") {
    try {
      const isPDF = filePath.toLowerCase().endsWith(".pdf");

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: isPDF ? "raw" : "auto",
        folder: folder,
        type: "authenticated", // very important
        access_mode: "authenticated",
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
  static async getSignedUrl(publicId: string): Promise<string> {
    return cloudinary.utils.private_download_url(publicId, "pdf", {
      type: "authenticated",
      resource_type: "raw",
    });
  }

  static async downloadFile(url: string, outputPath: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const writer = fs.createWriteStream(outputPath);
        const response = await axios.get(url, {
          responseType: "stream",
        });

        response.data.pipe(writer);

        writer.on("finish", () => resolve(outputPath));
        writer.on("error", reject);
      } catch (err) {
        reject(err);
      }
    });
  }
}
