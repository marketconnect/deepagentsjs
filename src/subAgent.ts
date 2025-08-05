/**
 * SubAgent implementation for Deep Agents
 * 
 * Task tool creation and sub-agent management.
 * Creates SubAgent interface matching Python's TypedDict structure and implements
 * createTaskTool() function that creates agents map, handles tool resolution by name,
 * and returns a tool function that uses createReactAgent for sub-agents.
 */

import { tool, StructuredTool } from "@langchain/core/tools";
import { ToolMessage } from "@langchain/core/messages";
import { Command, getCurrentTaskInput } from "@langchain/langgraph";
import { ToolRunnableConfig } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import type { SubAgent } from "./types.js";
import { DeepAgentState } from "./state.js";
import { getDefaultModel } from "./model.js";
import { 
  writeTodos, 
  readFile, 
  writeFile, 
  editFile, 
  ls 
} from "./tools.js";

/**
 * Built-in tools map for tool resolution by name
 */
const BUILTIN_TOOLS: Record<string, StructuredTool> = {
  'write_todos': writeTodos,
  'read_file': readFile,
  'write_file': writeFile,
  'edit_file': editFile,
  'ls': ls,
};

/**
 * Create task tool function that creates agents map, handles tool resolution by name,
 * and returns a tool function that uses createReactAgent for sub-agents.
 * Uses Command for state updates and navigation between agents.
 */
export function createTaskTool(
  subagents: SubAgent[],
  tools: Record<string, StructuredTool> = {},
  model = getDefaultModel(),
  stateSchema = DeepAgentState
) {
  // Create agents map from subagents array
  const agentsMap = new Map<string, SubAgent>();
  for (const subagent of subagents) {
    agentsMap.set(subagent.name, subagent);
  }

  // Combine built-in tools with provided tools for tool resolution
  const allTools = { ...BUILTIN_TOOLS, ...tools };

  return tool(
    async (
      input: { agent_name: string; task: string },
      config: ToolRunnableConfig
    ) => {
      const { agent_name, task } = input;

      // Get the subagent configuration
      const subagent = agentsMap.get(agent_name);
      if (!subagent) {
        return `Error: Agent '${agent_name}' not found. Available agents: ${Array.from(agentsMap.keys()).join(', ')}`;
      }

      // Resolve tools by name for this subagent
      const subagentTools: StructuredTool[] = [];
      if (subagent.tools) {
        for (const toolName of subagent.tools) {
          const resolvedTool = allTools[toolName];
          if (resolvedTool) {
            subagentTools.push(resolvedTool);
          } else {
            console.warn(`Warning: Tool '${toolName}' not found for agent '${agent_name}'`);
          }
        }
      }

      try {
        // Create react agent for the subagent
        const reactAgent = createReactAgent({
          llm: model,
          tools: subagentTools,
          stateSchema: stateSchema,
          messageModifier: subagent.prompt,
        });

        // Get current state for context
        const currentState = getCurrentTaskInput() as typeof DeepAgentState.State;

        // Execute the subagent with the task
        const result = await reactAgent.invoke({
          messages: [
            {
              role: "user",
              content: task,
            }
          ],
          todos: currentState.todos || [],
          files: currentState.files || {},
        }, config);

        // Use Command for state updates and navigation between agents
        return new Command({
          update: {
            todos: result.todos || currentState.todos,
            files: result.files || currentState.files,
            messages: [
              new ToolMessage({
                content: `Completed task '${task}' using agent '${agent_name}'. Result: ${JSON.stringify(result.messages?.slice(-1)[0]?.content || 'Task completed')}`,
                tool_call_id: config.toolCall?.id as string,
              }),
            ],
          },
        });

      } catch (error) {
        // Handle errors gracefully
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Command({
          update: {
            messages: [
              new ToolMessage({
                content: `Error executing task '${task}' with agent '${agent_name}': ${errorMessage}`,
                tool_call_id: config.toolCall?.id as string,
              }),
            ],
          },
        });
      }
    },
    {
      name: "task",
      description: `Execute a task using a specialized sub-agent. Available agents: ${subagents.map(a => `${a.name} - ${a.description}`).join('; ')}`,
      schema: z.object({
        agent_name: z.string().describe(`Name of the agent to use. Available: ${subagents.map(a => a.name).join(', ')}`),
        task: z.string().describe("The task to execute with the selected agent"),
      }),
    }
  );
}


