import { body } from "express-validator";

export class UploadsValidator {
  static uploadMaterial() {
    return [
      body("title", "Title is required").isString(),
      body("upload_type", "Type of document is required").isString(),
      body("subject_id", "Subject must be present").isString(),
      body("uploaded_url", "uploadable document is require").custom(
        (value, { req }) => {
          if (!req.file) {
            throw new Error("uploadable document is require");
          }
          return true;
        }
      ),
    ];
  }

  static updateMaterial() {
    return [
      body("title", "Title is required").isString(),
      body("upload_type", "Type of document is required").isString(),
      body("subject_id", "Subject must be present").isString(),
    ];
  }
}
