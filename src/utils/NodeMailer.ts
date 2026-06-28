import nodeMailer from "nodemailer";
import SendGrid from "nodemailer-sendgrid-transport";
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

  static async sendEmail(data: {
    to: string[];
    subject: string;
    html: string;
  }): Promise<any> {
    try {
      console.log("Sending email from:", getEnvironmentVariables().sendgrid_sender_email);
      return await NodeMailer.initialTransport().sendMail({
        from: getEnvironmentVariables().sendgrid_sender_email,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });
    } catch (error: any) {
      console.error("❌ SendGrid Email Error:", error.message);
      console.log("✉️  Mocked Email Details:");
      console.log(`   To: ${data.to.join(", ")}`);
      console.log(`   Subject: ${data.subject}`);
      console.log(`   Content: ${data.html}`);
      return { mock: true, success: false, error: error.message };
    }
  }
}
