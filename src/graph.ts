/**
 * Main createDeepAgent function for Deep Agents
 * 
 * Main entry point for creating deep agents with TypeScript types for all parameters:
 * tools, instructions, model, subagents, and stateSchema. Combines built-in tools with
 * provided tools, creates task tool using createTaskTool(), and returns createReactAgent
 * with proper configuration. Ensures exact parameter matching and behavior with Python version.
 */

import { createReactAgent } from "@langchain/langgraph";
import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { createTaskTool } from "./subAgent.js";
import { getDefaultModel } from "./model.js";
import { DeepAgentState } from "./state.js";
import { 
  writeTodos, 
  readFile, 
  writeFile, 
  editFile, 
  ls 
} from "./tools.js";
import type { SubAgent, StateSchemaType } from "./types.js";

/**
 * Built-in tools that are always available in Deep Agents
 */
const BUILTIN_TOOLS = [
  writeTodos,
  readFile,
  writeFile,
  editFile,
  ls,
] as const;

/**
 * Parameters for createDeepAgent function with TypeScript types
 */
export interface CreateDeepAgentParams<T extends typeof DeepAgentState = typeof DeepAgentState> {
  /** Additional tools to provide to the agent beyond built-in tools */
  tools?: any[];
  /** System instructions/prompt for the agent */
  instructions?: string;
  /** Language model to use (defaults to getDefaultModel()) */
  model?: BaseLanguageModelInterface;
  /** Sub-agents for specialized task handling */
  subagents?: SubAgent[];
  /** State schema class (defaults to DeepAgentState) */
  stateSchema?: StateSchemaType<T>;
}

/**
 * Create a Deep Agent with TypeScript types for all parameters.
 * Combines built-in tools with provided tools, creates task tool using createTaskTool(),
 * and returns createReactAgent with proper configuration.
 * Ensures exact parameter matching and behavior with Python version.
 */
export function createDeepAgent<T extends typeof DeepAgentState = typeof DeepAgentState>(
  params: CreateDeepAgentParams<T> = {}
) {
  const {
    tools = [],
    instructions,
    model = getDefaultModel(),
    subagents = [],
    stateSchema = DeepAgentState as StateSchemaType<T>,
  } = params;

  // Combine built-in tools with provided tools
  const allTools = [...BUILTIN_TOOLS, ...tools];

  // Create task tool using createTaskTool() if subagents are provided
  if (subagents.length > 0) {
    // Create tools map for task tool creation
    const toolsMap: Record<string, any> = {};
    for (const tool of allTools) {
      if (tool.name) {
        toolsMap[tool.name] = tool;
      }
    }

    const taskTool = createTaskTool(subagents, toolsMap, model, stateSchema);
    allTools.push(taskTool);
  }

  // Return createReactAgent with proper configuration
  return createReactAgent({
    llm: model,
    tools: allTools,
    stateSchema: stateSchema,
    messageModifier: instructions,
  });
}

/**
 * Default export for convenience
 */
export default createDeepAgent;

