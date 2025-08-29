import { DevEnvironment } from "./environment.dev";
import { ProdEnvironment } from "./environment.prod";


export interface Environment {
  db_uri: string;
  sendgrid_api: string;
  jwt_secret_key: string;
  refresh_secret_key: string;
  sendgrid_sender_email: string;
}

export function getEnvironmentVariables() {
  if (process.env.NODE_ENV === "production") {
    return ProdEnvironment;
  }
  return DevEnvironment;
}
