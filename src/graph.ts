/**
 * Main createDeepAgent function for Deep Agents
 *
 * Main entry point for creating deep agents with TypeScript types for all parameters:
 * tools, instructions, model, subagents, and stateSchema. Combines built-in tools with
 * provided tools, creates task tool using createTaskTool(), and returns createReactAgent
 * with proper configuration. Ensures exact parameter matching and behavior with Python version.
 */

import "@langchain/anthropic/zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createTaskTool } from "./subAgent.js";
import { getDefaultModel } from "./model.js";
import { writeTodos, readFile, writeFile, editFile, ls } from "./tools.js";
import type { CreateDeepAgentParams } from "./types.js";
import type { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Built-in tools that are always available in Deep Agents
 */
const BUILTIN_TOOLS: StructuredTool[] = [
  writeTodos,
  readFile,
  writeFile,
  editFile,
  ls,
];

/**
 * Create a Deep Agent with TypeScript types for all parameters.
 * Combines built-in tools with provided tools, creates task tool using createTaskTool(),
 * and returns createReactAgent with proper configuration.
 * Ensures exact parameter matching and behavior with Python version.
 */
export function createDeepAgent<
  StateSchema extends z.ZodObject<any, any, any, any, any>,
>(params: CreateDeepAgentParams<StateSchema> = {}) {
  const {
    tools = [],
    instructions,
    model = getDefaultModel(),
    subagents = [],
    stateSchema,
  } = params;

  // Combine built-in tools with provided tools
  const allTools: StructuredTool[] = [...BUILTIN_TOOLS, ...tools];
  // Create task tool using createTaskTool() if subagents are provided
  if (subagents.length > 0) {
    // Create tools map for task tool creation
    const toolsMap: Record<string, StructuredTool> = {};
    for (const tool of allTools) {
      if (tool.name) {
        toolsMap[tool.name] = tool;
      }
    }

    const taskTool = createTaskTool({
      subagents,
      tools: toolsMap,
      model,
      stateSchema,
    });
    allTools.push(taskTool);
  }

  // Return createReactAgent with proper configuration
  return createReactAgent({
    llm: model,
    tools: allTools,
    stateSchema,
    messageModifier: instructions,
  });
}

/**
 * Default export for convenience
 */
export default createDeepAgent;
