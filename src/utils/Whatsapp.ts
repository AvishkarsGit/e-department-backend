import axios from "axios";
import { getEnvironmentVariables } from "../environments/environment";
export class Whatsapp {

  static async createMessage(message: string, to:string) {
    try {
      const response = await axios({
        method: "POST",
        url: `https://graph.facebook.com/v22.0/${getEnvironmentVariables().whatsapp_phone_number_id}/messages`,
        headers: {
          Authorization: `Bearer ${getEnvironmentVariables().whatsapp_access_token}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: `+91${to}`,
          type: "text",
          text: {
            body: `${message}`,
          },
        },
      });
      return response.data;
    } catch (error:any) {
      const apiError = error.response?.data?.error?.message || error.message;
      throw new Error(apiError);
    }
  }
}
