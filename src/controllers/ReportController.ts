import Report from "../models/Report";
import { Cloudinary } from "../utils/Cloudinary";
import { Whatsapp } from "../utils/Whatsapp";

export class ReportController {
  static async uploadReport(req, res, next) {
    try {
      if (!req.file) {
        throw new Error("File not found");
      }
      const file = req.file.path;
      const response = await Cloudinary.uploadExcelToCloud(file);

      if (!response) {
        throw new Error("Error uploading file");
      }

      // save to db
      const report = await new Report({
        report_url: response?.secure_url,
        date: Date.now(),
      }).save();

      if (!report) {
        throw new Error("failed to save");
      }

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async sendBulkMessage(req, res, next) {
    try {
      //find attendance report url
      const report = await Report.findOne().select("report_url");
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      const numbers_data = [
        { name: "Avishkar Kumbhar", mobile_num: "7841961074" },
        // { name: "Rushikesh Gaikwad", mobile_num: "9028641866" },
        // { name: "Dipali Kumbhar", mobile_num: "9921751084" },
      ];

      // Prepare all messages
      const message_promises = numbers_data.map(async (data) => {
        const message = `Hello ${data.name}, your attendance is too low. you have to attend college regular otherwise further action will be taken.Your can see your attendance with above link.\n\n\nLink:${report.report_url}`;
        try {
          const result = await Whatsapp.createMessage(message, data.mobile_num);
          return result;
        } catch (err: any) {
          throw new Error(err);
        }
      });
      // Wait for all messages (run concurrently)
      const results = await Promise.all(message_promises);

      res.json({ success: true, data: results, message: "message sent" });
    } catch (error) {
      next(error);
    }
  }
}
