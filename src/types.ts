/**
 * TypeScript type definitions for Deep Agents
 * 
 * This file contains all the TypeScript interfaces and types that correspond
 * to the Python TypedDict and other type definitions.
 */

import type { DeepAgentState } from './state.js';

/**
 * SubAgent interface matching Python's TypedDict structure
 */
export interface SubAgent {
  name: string;
  description: string;
  prompt: string;
  tools?: string[];
}

/**
 * Todo interface matching Python's TypedDict
 */
export interface Todo {
  content: string;
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
