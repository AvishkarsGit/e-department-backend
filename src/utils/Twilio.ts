import twilio from "twilio";
import Report from "../models/Report";
import { Request, Response, NextFunction } from "express";
import { Whatsapp } from "./Whatsapp";

export class TwilioService {
  private static client: twilio.Twilio | null = null;

  private static getClient(): twilio.Twilio | null {
    const accountSid = process.env["TWILIO_ACCOUNT_SID"];
    const authToken = process.env["TWILIO_AUTH_TOKEN"];
    if (accountSid && authToken && !accountSid.startsWith("ACXXX")) {
      if (!this.client) {
        this.client = twilio(accountSid, authToken);
      }
      return this.client;
    }
    return null;
  }

  static async sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
    try {
      const client = this.getClient();
      const fromNumber = process.env["TWILIO_WHATSAPP_NUMBER"] || "whatsapp:+14155238886";
      console.log('from', fromNumber);
      let cleanedTo = to.replace(/[\s\+]/g, "");
      console.log('cleaned To', cleanedTo)
      if (!cleanedTo.startsWith("whatsapp:")) {
        if (cleanedTo.length === 10) {
          cleanedTo = `whatsapp:+91${cleanedTo}`;
        } else {
          cleanedTo = `whatsapp:+${cleanedTo}`;
        }
      }

      if (client) {
        console.log(`Sending Twilio WhatsApp message to ${cleanedTo}...`);
        await client.messages.create({
          from: fromNumber,
          to: cleanedTo,
          body: body,
        });
        return true;
      } else {
        console.log(`[Twilio Sandbox Mock] To: ${cleanedTo}, Body: ${body}`);
        return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Twilio error:", error.message);
        throw new Error(error.message);
      }
      console.error("Twilio unknown error:", error);
      throw new Error("Failed to send WhatsApp message via Twilio");
    }
  }

  static async createMessage(
    message: string,
    phone: string
  ): Promise<any> {
    try {
      console.log(process.env.TWILIO_WHATSAPP_NUMBER);
      const client = this.getClient() || twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_NUMBER!, // whatsapp:+14155238886
        to: `whatsapp:+91${phone}`,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }


}
