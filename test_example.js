/**
 * Simple test example for Deep Agents TypeScript
 */

import { createDeepAgent } from './src/graph.js';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Simple custom tool
const helloTool = tool(
  async (input) => {
    return `Hello, ${input.name}! Welcome to Deep Agents!`;
  },
  {
    name: "hello",
    description: "A simple greeting tool",
    schema: z.object({
      name: z.string().describe("Name to greet"),
    }),
  }
);

// Create the agent
const agent = createDeepAgent({
  tools: [helloTool],
  instructions: "You are a helpful assistant that can greet people and perform basic tasks. Use the hello tool to greet people.",
});



// Test the agent
async function testAgent() {
  console.log("🤖 Testing Deep Agents TypeScript...");
  try {
    const inputs = {
        messages: [{ role: "user", content: "say hello to alice?" }],
      };

    const stream = await agent.stream(inputs, { streamMode: "values" });

    for await (const { messages } of stream) {
      console.log(messages);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the test
testAgent(); 