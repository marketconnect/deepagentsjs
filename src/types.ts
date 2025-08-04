/**
 * TypeScript type definitions for Deep Agents
 * 
 * This file contains all the TypeScript interfaces and types that correspond
 * to the Python TypedDict and other type definitions. Defines all necessary
 * TypeScript interfaces and types including StateSchemaType, SubAgent, Todo,
 * and proper generic types for state schemas.
 */

import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { DeepAgentState } from './state.js';

/**
 * SubAgent interface matching Python's TypedDict structure
 */
export interface SubAgent {
  /** Name of the sub-agent */
  name: string;
  /** Description of what the sub-agent does */
  description: string;
  /** System prompt for the sub-agent */
  prompt: string;
  /** Optional list of tool names available to this sub-agent */
  tools?: string[];
}

/**
 * Todo interface matching Python's TypedDict
 */
export interface Todo {
  /** Content of the todo item */
  content: string;
  /** Status of the todo - pending, in_progress, or completed */
  status: 'pending' | 'in_progress' | 'completed';
}

/**
 * Type for state schema classes that extend DeepAgentState
 */
export type StateSchemaType<T extends typeof DeepAgentState = typeof DeepAgentState> = T;

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
 * Parameters for createTaskTool function
 */
export interface CreateTaskToolParams {
  /** Array of sub-agents to create task tool for */
  subagents: SubAgent[];
  /** Additional tools map for tool resolution */
  tools?: Record<string, any>;
  /** Language model to use */
  model?: BaseLanguageModelInterface;
  /** State schema to use */
  stateSchema?: StateSchemaType<any>;
}

/**
 * Tool function type for Deep Agents tools
 */
export type DeepAgentTool = {
  name: string;
  description: string;
  schema: any;
  func: (...args: any[]) => any;
};

/**
 * File system type for mock file operations
 */
export type MockFileSystem = Record<string, string>;

/**
 * Reducer function type for state channels
 */
export type ReducerFunction<T> = (left: T | null | undefined, right: T | null | undefined) => T;

/**
 * Status type for todos
 */
export type TodoStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Tool input schemas
 */
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

