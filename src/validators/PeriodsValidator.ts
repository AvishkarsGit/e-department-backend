import { body } from "express-validator";

export class PeriodsValidator {
  static savePeriod() {
    return [
      body("period_text", "Period text is required").isString(),
      body("period", "Period number is required").isNumeric(),
      body("start_time", "Please select starting time").isString(),
      body("ending_time", "Please select ending time").isString(),
    ];
  }
  static updatePeriod() {
    return [
      body("period_text", "Period text is required").isString(),
      body("period", "Period number is required").isNumeric(),
      body("start_time", "Please select starting time").isString(),
      body("ending_time", "Please select ending time").isString(),
    ];
  }
}
