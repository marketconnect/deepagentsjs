/**
 * Main createDeepAgent function for Deep Agents
 *
 * Main entry point for creating deep agents with TypeScript types for all parameters:
 * tools, instructions, model, subagents, and stateSchema. Combines built-in tools with
 * provided tools, creates task tool using createTaskTool(), and returns createReactAgent
 * with proper configuration. Ensures exact parameter matching and behavior with Python version.
 */

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createTaskTool } from "./subAgent.js";
import { getDefaultModel } from "./model.js";
import { DeepAgentState } from "./state.js";
import { writeTodos, readFile, writeFile, editFile, ls } from "./tools.js";
import type { StateSchemaType, CreateDeepAgentParams } from "./types.js";
import type { StructuredTool } from "@langchain/core/tools";
import type { LanguageModelLike } from "@langchain/core/language_models/base";

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
  T extends typeof DeepAgentState = typeof DeepAgentState,
>(params: CreateDeepAgentParams<T> = {}) {
  const {
    tools = [],
    instructions,
    model = getDefaultModel(),
    subagents = [],
    stateSchema = DeepAgentState as StateSchemaType<T>,
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

    const taskTool = createTaskTool(
      subagents,
      toolsMap,
      model as any,
      stateSchema,
    );
    allTools.push(taskTool);
  }

  // Return createReactAgent with proper configuration
  return createReactAgent({
    llm: model as LanguageModelLike,
    tools: allTools,
    stateSchema: stateSchema,
    messageModifier: instructions,
  });
}

/**
 * Default export for convenience
 */
export default createDeepAgent;
