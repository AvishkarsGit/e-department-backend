import { Environment } from "./environment";
import { requireEnv } from "./environment.config";
export const DevEnvironment: Environment = {
  db_uri: requireEnv('DEV_DB_URI'),
  sendgrid_api: requireEnv('DEV_SENDGRID_API'),
  jwt_secret_key: requireEnv('DEV_JWT_SECRETE_KEY'),
  refresh_secret_key: requireEnv('DEV_JWT_REFRESH_SECRETE_KEY'),
  sendgrid_sender_email: requireEnv('DEV_SENDGRID_SENDER_EMAIL'),
  cloud_name: requireEnv('DEV_CLOUDINARY_NAME'),
  cloud_api_key: requireEnv('DEV_CLOUDINARY_API_KEY'),
  cloud_api_secret: requireEnv('DEV_CLOUDINARY_API_SECRET'),
  aws_access_key_id: requireEnv('AWS_ACCESS_KEY'),
  aws_secret_access_key: requireEnv('AWS_SECRET_KEY'),
  bucket_name: requireEnv('BUCKET_NAME'),
  aws_region: requireEnv('AWS_REGION'),
  whatsapp_access_token: requireEnv('ACCESS_TOKEN'),
  whatsapp_phone_number_id:requireEnv('PHONE_NUMBER_ID') 
};
