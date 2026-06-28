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
    console.log("GEMINI_API_KEY", this.apiKey);
    console.log("GEMINI_MODEL", this.modelName);
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
      console.error("❌ Gemini API Error:", error.message);
      
      const errorMsg = String(error.message);
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("Quota exceeded")) {
        console.warn("⚠️ Gemini free tier quota exceeded or key restricted. Falling back to offline mock response.");
        
        let mockReply = `[System: Gemini API Quota Exceeded]\nI received your query: "${prompt}".\n\n`;
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes("attendance")) {
          mockReply += "I can help track student attendance. To do so, please ensure a valid Gemini API key is configured in your .env file so I can retrieve records from the database.";
        } else if (lowerPrompt.includes("student") || lowerPrompt.includes("faculty")) {
          mockReply += "I am designed to look up details about students and faculty members. Please update your GEMINI_API_KEY in the .env file to enable live database queries.";
        } else if (lowerPrompt.includes("subject") || lowerPrompt.includes("class")) {
          mockReply += "I can assist in managing classes and assigning subjects. Please configure a valid Gemini API key to execute these actions.";
        } else {
          mockReply += "I am your Department ERP Assistant. I can help you manage classes, attendance, and study materials. Please check your Gemini API key setup to restore full AI capabilities.";
        }
        
        return mockReply;
      }
      
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

export default GeminiProvider;
