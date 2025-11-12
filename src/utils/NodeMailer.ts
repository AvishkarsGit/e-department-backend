import  nodeMailer from "nodemailer";
import  SendGrid from "nodemailer-sendgrid-transport";
import { getEnvironmentVariables } from "../environments/environment";
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
      from: getEnvironmentVariables().sendgrid_sender_email,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
