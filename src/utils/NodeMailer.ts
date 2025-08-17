import * as nodeMailer from "nodemailer";
import * as SendGrid from "nodemailer-sendgrid-transport";
import { getEnvironmentVariables } from "../environment/environment";

export class NodeMailer {
  static initialTransport() {
    return nodeMailer.createTransport(
      SendGrid({
        auth: {
          api_key: getEnvironmentVariables().sendgrid_api,
        },
      })
    );
  }

  static sendEmail(data: {
    to: string[];
    subject: string;
    html: string;
  }): Promise<any> {
    return NodeMailer.initialTransport().sendMail({
      from: "departmentmanagement2025@gmail.com",
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
