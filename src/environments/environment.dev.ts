import { Environment } from "./environment";

export const DevEnvironment: Environment = {
  db_uri: process.env.DEV_DB_URI,
  sendgrid_api: process.env.DEV_SENDGRID_API,
  jwt_secret_key: process.env.DEV_JWT_SECRETE_KEY,
  refresh_secret_key: process.env.DEV_JWT_REFRESH_SECRETE_KEY,
  sendgrid_sender_email: process.env.DEV_SENDGRID_SENDER_EMAIL,
  cloud_name: process.env.DEV_CLOUDINARY_NAME,
  cloud_api_key: process.env.DEV_CLOUDINARY_API_KEY,
  cloud_api_secret: process.env.DEV_CLOUDINARY_API_SECRET,
  aws_access_key_id: process.env.AWS_ACCESS_KEY,
  aws_secret_access_key: process.env.AWS_SECRET_KEY,
  bucket_name: process.env.BUCKET_NAME,
  aws_region: process.env.AWS_REGION,
};
