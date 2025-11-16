import { Environment } from "./environment";

export const ProdEnvironment: Environment = {
  db_uri: process.env.PROD_DB_URI,
  sendgrid_api: process.env.PROD_SENDGRID_API,
  jwt_secret_key: process.env.PROD_JWT_SECRETE_KEY,
  refresh_secret_key: process.env.PROD_JWT_REFRESH_SECRETE_KEY,
  sendgrid_sender_email: process.env.PROD_SENDGRID_SENDER_EMAIL,
  cloud_name: process.env.PROD_CLOUDINARY_NAME,
  cloud_api_key: process.env.PROD_CLOUDINARY_API_KEY,
  cloud_api_secret: process.env.PROD_CLOUDINARY_API_KEY,
  aws_access_key_id: process.env.AWS_ACCESS_KEY,
  aws_secret_access_key: process.env.AWS_SECRET_KEY,
  bucket_name: process.env.BUCKET_NAME,
  aws_region: process.env.AWS_REGION,
};
