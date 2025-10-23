import axios from "axios";
export class Whatsapp {

  static async createMessage(message: string, to:string) {
    try {
      const response = await axios({
        method: "POST",
        url: `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
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
    } catch (error) {
      const apiError = error.response?.data?.error?.message || error.message;
      throw new Error(apiError);
    }
  }
}
