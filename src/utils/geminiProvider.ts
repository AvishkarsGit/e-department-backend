import { GoogleGenAI } from "@google/genai";
import { McpClientInstance } from "../mcp/McpClassInstance";

class GeminiProvider {
  private apiKey: string;
  private modelName: string;
  private chatHistory: any[] = [];

  constructor(apiKey: string, modelName: string) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
    if (!modelName) throw new Error("GEMINI_MODEL is missing");
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async generate(prompt: string, token: string) {
    try {
      const genAI = new GoogleGenAI({ apiKey: this.apiKey });
      const mcpClient = await McpClientInstance.getInstance();
      McpClientInstance.setToken(token);
      const tools = McpClientInstance.tools;

      // Push current user message
      this.chatHistory.push({
        role: "user",
        parts: [
          {
            text: prompt,
            type: "text",
          },
        ],
      });

      // Send to Gemini
      const response = await genAI.models.generateContent({
        model: this.modelName,
        contents: this.chatHistory,
        config: { tools: [{ functionDeclarations: tools }] },
      });

      const result = response?.candidates?.[0].content.parts[0].text;
      const functionCall =
        response?.candidates?.[0].content.parts[0].functionCall;

      if (functionCall) {
        // Call MCP tool if requested
        const toolResult = await mcpClient.callTool({
          name: functionCall.name,
          arguments: functionCall.args,
        });
        const toolText = toolResult?.content?.[0]?.text || "";

        // Push tool result into history as user message
        this.chatHistory.push({
          role: "user",
          parts: [
            {
              type: "text",
              text: `Tool result: ${toolText}`,
            },
          ],
        });

        // Get follow-up response from Gemini
        const followUp = await genAI.models.generateContent({
          model: this.modelName,
          contents: this.chatHistory,
        });

        const followUpText =
          followUp?.candidates?.[0]?.content.parts[0].text || "No Response";

        // Push model response into history
        this.chatHistory.push({
          role: "model",
          parts: [{ type: "text", text: followUpText }],
        });

        return followUpText;
      }

      const responseText = result || "No Response";

      // Push model response into history
      this.chatHistory.push({
        role: "model",
        parts: [{ type: "text", text: responseText }],
      });

      return responseText;
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

export default GeminiProvider;
