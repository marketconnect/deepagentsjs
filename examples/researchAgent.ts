/* eslint-disable no-console */
import { createDeepAgent } from "../src/index.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import "dotenv/config";

type Topic = "general" | "news" | "finance";

// Search tool to use to do research
const internetSearch = tool(
  async ({
    query,
    maxResults = 5,
    topic = "general" as Topic,
    includeRawContent = false,
  }: {
    query: string;
    maxResults?: number;
    topic?: Topic;
    includeRawContent?: boolean;
  }) => {
    /**
     * Run a web search
     */

    // Note: You'll need to install and import tavily-js or similar package
    // For now, this is a placeholder that shows the structure
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        include_raw_content: includeRawContent,
        topic,
      }),
    });
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return await response.json();
  },
  {
    name: "internet_search",
    description: "Run a web search",
    schema: z.object({
      query: z.string().describe("The search query"),
      maxResults: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of results to return"),
      topic: z
        .enum(["general", "news", "finance"])
        .optional()
        .default("general")
        .describe("Search topic category"),
      includeRawContent: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to include raw content"),
    }),
  },
);

// Prompt prefix to steer the agent to be an expert researcher
const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research, and then write a polished report.

You have access to a few tools.

## \`internet_search\`

Use this to run an internet search for a given query. You can specify the number of results, the topic, and whether raw content should be included.
`;

// Create the agent
const agent = createDeepAgent({
  tools: [internetSearch],
  instructions: researchInstructions,
});

// Invoke the agent
async function main() {
  const result = await agent.invoke({
    messages: [{ role: "user", content: "what is langgraph?" }],
  });
  console.log(result);
}

export { agent, internetSearch };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
