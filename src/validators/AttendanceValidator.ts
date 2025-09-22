import { query } from "express-validator";

export class AttendanceValidator {
  static filteredBySubject() {
    return [query("subject_id", "Subject should be there").isString()];
  }
}
