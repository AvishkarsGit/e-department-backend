import { body, query } from "express-validator";

export class AttendanceValidator {
  static saveAttendance() {
    return [
      body("subject_id", "Please provide Subject").isString(),
      body("period_id", "Please provide period").isString(),
      body("faculty_id", "Faculty must required").isString(),
      body("attendance", "Attendance record must be there").isJSON(),
    ];
  }

  static filterAttendance() {
    return [
      query("from_date", "Pick From date")
        .isISO8601()
        .toDate()
        .custom((value, { req }) => {
          const fromDate = new Date(value);
          fromDate.setHours(0, 0, 0, 0); // normalize to midnight

          // optional: prevent future from_date
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (fromDate > today) {
            throw new Error("From date cannot be in the future");
          }
          return true;
        }),

      query("to_date", "Pick To date")
        .isISO8601()
        .toDate()
        .custom((value, { req }) => {
          const toDate = new Date(value);
          toDate.setHours(23, 59, 59, 999); // end of day

          const fromDate = new Date(req.query.from_date);
          fromDate.setHours(0, 0, 0, 0);

          if (toDate < fromDate) {
            throw new Error("To date cannot be earlier than From date");
          }
          return true;
        }),

      query("class_id", "Class should be there").isString(),
      query("subject_id", "Subject should be there").isString(),
    ];
  }

  static getStudentAttendance() {
    return [
      query("subject_id", "Subject not provided").isString(),
      query("student_id", "Student information not provided").isString(),
    ];
  }
}
