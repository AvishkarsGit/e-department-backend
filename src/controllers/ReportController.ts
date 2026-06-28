import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Report from "../models/Report";
import Attendance from "../models/Attendance";
import { Cloudinary } from "../utils/Cloudinary";
import { TwilioService } from "../utils/Twilio";

export class ReportController {
  static async uploadReport(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        report_url: response.secure_url,
        date: new Date(),
      }).save();

      if (!report) {
        throw new Error("failed to save");
      }

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async sendBulkMessage(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
        { name: "Rohan Jantre", mobile_num: "9156849085" },
        { name: "Avishkar Kumbhar", mobile_num: "7841961074" },
        { name: "Rushikesh Gaikwad", mobile_num: "9028641866" },
        { name: "Ganesh More", mobile_num: "7498310055" },
      ];

      // Prepare all messages
      const message_promises = numbers_data.map(async (data) => {
        const message = `Hello ${data.name}, your attendance is too low. you have to attend college regular otherwise further action will be taken.Your can see your attendance with above link.\n\n\nLink:${report.report_url}`;
        try {
          const result = await TwilioService.createMessage(message, data.mobile_num);
          return result;
        } catch (err: any) {
          throw new Error(err);
        }
      });
      // Wait for all messages (run concurrently)
      const results = await Promise.all(message_promises);

      return res.json({ success: true, data: results, message: "message sent" });
    } catch (error) {
      next(error);
    }
  }

  // static async sendBulkMessage(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  //   try {
  //     const class_id = req.body.class_id;
  //     const criteriaInput = req.body.criteria;
  //     const criteria = criteriaInput ? Number(criteriaInput) : 75;

  //     if (!class_id) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "class_id is required",
  //       });
  //     }

  //     // Find attendance report url (latest one)
  //     const report = await Report.findOne().sort({ createdAt: -1 }).select("report_url");
  //     if (!report) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Report not found",
  //       });
  //     }

  //     const classObjectId = new mongoose.Types.ObjectId(String(class_id));

  //     // Aggregate student attendance for this class and get overall percentage
  //     const studentSummaries = await Attendance.aggregate([
  //       {
  //         $match: {
  //           class_id: classObjectId,
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "$student_id",
  //           total_classes: { $sum: 1 },
  //           attended_classes: {
  //             $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           attendance_percentage: {
  //             $cond: [
  //               { $eq: ["$total_classes", 0] },
  //               0,
  //               {
  //                 $multiply: [
  //                   { $divide: ["$attended_classes", "$total_classes"] },
  //                   100,
  //                 ],
  //               },
  //             ],
  //           },
  //         },
  //       },
  //       {
  //         $match: {
  //           attendance_percentage: { $lt: criteria },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "students",
  //           localField: "_id",
  //           foreignField: "_id",
  //           as: "student",
  //         },
  //       },
  //       { $unwind: "$student" },
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "student.user_id",
  //           foreignField: "_id",
  //           as: "user",
  //         },
  //       },
  //       { $unwind: "$user" },
  //     ]);

  //     interface NotificationResult {
  //       name: string;
  //       role: string;
  //       status: string;
  //       phone?: string;
  //       error?: string;
  //     }

  //     const results: NotificationResult[] = [];

  //     for (const summary of studentSummaries) {
  //       const studentName = String(summary.user.name);
  //       const studentPhone = String(summary.user.phone);
  //       const percentage = Number(summary.attendance_percentage).toFixed(2);

  //       // Student WhatsApp
  //       const studentMsg = `Hello ${studentName}, your overall attendance is ${percentage}%, which is below the required ${criteria}%. Please attend classes regularly. You can view the attendance report here: ${report.report_url}`;
  //       try {
  //         await TwilioService.sendWhatsAppMessage(studentPhone, studentMsg);
  //         results.push({ name: studentName, role: "student", status: "sent", phone: studentPhone });
  //       } catch (err) {
  //         results.push({
  //           name: studentName,
  //           role: "student",
  //           status: "failed",
  //           error: err instanceof Error ? err.message : String(err),
  //         });
  //       }

  //       // Guardian WhatsApp
  //       const guardians = summary.student.guardian;
  //       if (guardians && guardians.length > 0) {
  //         const guardian = guardians[0];
  //         const guardianName = String(guardian.name);
  //         const guardianPhone = String(guardian.phone);
  //         const guardianMsg = `Hello ${guardianName}, parent/guardian of ${studentName}. Their overall attendance is ${percentage}%, which is below the required ${criteria}%. Please ensure they attend classes regularly. Attendance report: ${report.report_url}`;
  //         try {
  //           await TwilioService.sendWhatsAppMessage(guardianPhone, guardianMsg);
  //           results.push({ name: guardianName, role: "guardian", status: "sent", phone: guardianPhone });
  //         } catch (err) {
  //           results.push({
  //             name: guardianName,
  //             role: "guardian",
  //             status: "failed",
  //             error: err instanceof Error ? err.message : String(err),
  //           });
  //         }
  //       }
  //     }

  //     return res.json({
  //       success: true,
  //       data: results,
  //       message: `Processed WhatsApp notifications for ${studentSummaries.length} students with attendance below ${criteria}%`,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}
