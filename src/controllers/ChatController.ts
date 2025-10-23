import GeminiProvider from "../utils/geminiProvider";
export class ChatController {
  static async createChat(req, res, next) {
    try {
      const { message,token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const gemini = new GeminiProvider(
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_MODEL
      );

      const reply = await gemini.generate(message,token);
      return res.json({ reply });
    } catch (error) {
      next(error);
    }
  }
}
