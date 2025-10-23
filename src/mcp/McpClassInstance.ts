import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export class McpClientInstance {
  private static instance: Client;
  public static tools: any[] = [];
  private static token: string | null = null; // ✅ store JWT here

  static async getInstance(): Promise<Client> {
    if (!this.instance) {
      const client = new Client({
        name: "department-client",
        version: "1.0.0",
      });

      await client.connect(
        new StreamableHTTPClientTransport(new URL("http://localhost:4000/mcp"))
      );
      console.log("connected to mcp");

      const list = await client.listTools();
      this.tools = list.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: tool.inputSchema.type,
            properties: tool.inputSchema.properties,
            required: tool.inputSchema.required,
          },
        };
      });

      this.instance = client;
    }
    return this.instance;
  }

  // Set token (called from your backend generate function)
  static setToken(token: string) {
    this.token = token;
  }

  // Retrieve token (used internally or by MCP tools)
  static getToken(): string | null {
    return this.token;
  }
}
