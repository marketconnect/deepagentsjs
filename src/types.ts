/**
 * TypeScript type definitions for Deep Agents
 *
 * This file contains all the TypeScript interfaces and types that correspond
 * to the Python TypedDict and other type definitions. Defines all necessary
 * TypeScript interfaces and types including StateSchemaType, SubAgent, Todo,
 * and proper generic types for state schemas.
 */

import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { StructuredTool } from "@langchain/core/tools";
import type { DeepAgentState } from "./state.js";

/**
 * SubAgent interface matching Python's TypedDict structure
 */
export interface SubAgent {
  name: string;
  description: string;
  prompt: string;
  tools?: string[];
}

export interface Todo {
  content: string;
  status: "pending" | "in_progress" | "completed";
}

/**
 * Type for state schema classes that extend DeepAgentState
 */
export type StateSchemaType<
  T extends typeof DeepAgentState = typeof DeepAgentState,
> = T;

/**
 * Extract the state type from a state schema
 */
export type DeepAgentStateType = typeof DeepAgentState.State;

/**
 * Generic type for any state schema that extends DeepAgentState
 */
export type AnyStateSchema = StateSchemaType<any>;

/**
 * Parameters for createDeepAgent function with TypeScript types
 */
export interface CreateDeepAgentParams<
  T extends typeof DeepAgentState = typeof DeepAgentState,
> {
  tools?: StructuredTool[];
  instructions?: string;
  model?: BaseLanguageModelInterface;
  subagents?: SubAgent[];
  stateSchema?: StateSchemaType<T>;
}

/**
 * Parameters for createTaskTool function
 */
export interface CreateTaskToolParams {
  subagents: SubAgent[];
  tools?: Record<string, StructuredTool>;
  model?: BaseLanguageModelInterface;
  stateSchema?: StateSchemaType<any>;
}

export type DeepAgentTool = StructuredTool;

export type MockFileSystem = Record<string, string>;

export type ReducerFunction<T> = (
  _prev: T | null | undefined,
  _next: T | null | undefined,
) => T;

export type TodoStatus = "pending" | "in_progress" | "completed";

export interface WriteTodosInput {
  todos: Todo[];
}

export interface ReadFileInput {
  file_path: string;
  offset?: number;
  limit?: number;
}

export interface WriteFileInput {
  file_path: string;
  content: string;
}

export interface EditFileInput {
  file_path: string;
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

export interface TaskToolInput {
  agent_name: string;
  task: string;
}
