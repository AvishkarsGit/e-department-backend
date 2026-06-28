import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getEnvironmentVariables } from "../environments/environment";
import fs from "fs";
import path from "path";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export class AWS {
  static async configure() {
    const s3 = new S3Client({
      region: getEnvironmentVariables().aws_region,
      credentials: {
        accessKeyId: getEnvironmentVariables().aws_access_key_id,
        secretAccessKey: getEnvironmentVariables().aws_secret_access_key,
      },
    });
    return s3;
  }

  static async uploadToS3(filePath, folder = "material") {
    try {
      const s3 = await this.configure();
      const fileContent = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);

      const uploadKey = `${folder}/${Date.now()}-${fileName}`;

      const params = {
        Bucket: getEnvironmentVariables().bucket_name,
        Key: uploadKey,
        Body: fileContent,
      };

      await s3.send(new PutObjectCommand(params));
      // generate URL
      const url = `https://${getEnvironmentVariables().bucket_name}.s3.${getEnvironmentVariables().aws_region
        }.amazonaws.com/${uploadKey}`;

      if (url && uploadKey) {
        //successfully upload file to cloudinary, unlink/delete the local files
        fs.unlinkSync(filePath);
      }
      return {
        secure_url: url,
        public_id: uploadKey, // Similar to cloudinary public_id
      };
    } catch (err) {
      throw err;
    }
  }

  static async deleteFromS3(public_id: string) {
    try {
      const s3 = await this.configure();
      await s3.send(
        new DeleteObjectCommand({
          Bucket: getEnvironmentVariables().bucket_name,
          Key: public_id,
        })
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getDownloadUrl(publicId: string) {
    try {
      const s3 = await this.configure();
      const command = new GetObjectCommand({
        Bucket: getEnvironmentVariables().bucket_name,
        Key: publicId,
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 min
      return url;
    } catch (error) {
      throw error;
    }
  }
}
