import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { McpController } from "../mcp/McpController";
import { McpClientInstance } from "./McpClassInstance";
export class McpTools {
  public mcpServer: McpServer;
  public mcp_tools: any[] = [];

  constructor(mcpServer: McpServer) {
    this.mcpServer = mcpServer;
  }

  registerTools() {
    // Add an addition tool
    this.mcpServer.registerTool(
      "fetchAttendance",
      {
        title: "Fetch Student Attendance",
        description:
          "Fetch the number of lectures attended, total lectures, and attendance percentage for the logged-in student.",
        inputSchema: {
          query: z
            .string()
            .optional()
            .describe("Optional question about attendance"),
        },
        outputSchema: {
          attendance: z.array(z.any()), // can keep empty or minimal
          summaries: z.array(z.any()), // can keep empty
          summaryText: z.string(),
        },
      },
      async (_args: { query?: string }, _extra: any): Promise<any> => {
        try {
          const token = McpClientInstance.getToken();
          if (!token) throw new Error("Token is required");

          const decoded = await McpController.decodeToken(token);
          const { id: userId, role } = decoded;
          if (role !== "student") throw new Error("Unauthorized role");

          // Call simplified controller
          const data = await McpController.getAttendanceRaw(userId);

          return {
            content: [
              {
                type: "text",
                text: `You have attended ${data.attendedLectures} out of ${data.totalLectures} lectures (${data.percentage}%).`,
              },
            ],
            structuredContent: {
              attendance: [], // optional, can leave empty
              summaries: [], // optional, can leave empty
              summaryText: `Attended ${data.attendedLectures}/${data.totalLectures} lectures (${data.percentage}%)`,
            },
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching attendance: ${error?.message || error}`,
              },
            ],
            structuredContent: {
              attendance: [],
              summaries: [],
              summaryText: "",
            },
          };
        }
      }
    );
  }
}
