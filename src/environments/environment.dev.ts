export const DevEnvironment = {
  db_uri: process.env.DEV_DB_URI,
  sendgrid_api: process.env.DEV_SENDGRID_API,
  jwt_secret_key: process.env.DEV_JWT_SECRETE_KEY,
  refresh_secret_key: process.env.DEV_JWT_REFRESH_SECRETE_KEY,
  sendgrid_sender_email: process.env.DEV_SENDGRID_SENDER_EMAIL,
  cloud_name: process.env.DEV_CLOUDINARY_NAME,
  cloud_api_key: process.env.DEV_CLOUDINARY_API_KEY,
  cloud_api_secret: process.env.DEV_CLOUDINARY_API_SECRET,
};
