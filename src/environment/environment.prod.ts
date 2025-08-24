import { Environment } from "./environment";

export const ProdEnvironment: Environment = {
  db_uri: process.env.PROD_DB_URI,
  sendgrid_api: process.env.PROD_SENDGRID_API,
  jwt_secret_key: process.env.PROD_JWT_SECRETE_KEY,
  refresh_secret_key: process.env.PROD_JWT_REFRESH_SECRETE_KEY,
  sendgrid_sender_email: process.env.PROD_SENDGRID_SENDER_EMAIL,
};
