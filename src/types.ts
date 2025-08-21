/**
 * TypeScript type definitions for Deep Agents
 *
 * This file contains all the TypeScript interfaces and types that correspond
 * to the Python TypedDict and other type definitions. Defines all necessary
 * TypeScript interfaces and types including StateSchemaType, SubAgent, Todo,
 * and proper generic types for state schemas.
 */

import type {
  BaseLanguageModelInput,
  LanguageModelOutput,
} from "@langchain/core/language_models/base";
import type { StructuredTool } from "@langchain/core/tools";
import type { DeepAgentState } from "./state.js";
import { z } from "zod";
import { Runnable } from "@langchain/core/runnables";

export type InferZodObjectShape<T> =
  T extends z.ZodObject<infer Shape> ? Shape : never;

/**
 * SubAgent interface matching Python's TypedDict structure
 */
export interface SubAgent {
  name: string;
  description: string;
  prompt: string;
  tools?: string[];
}

export type TodoStatus = "pending" | "in_progress" | "completed";

export interface Todo {
  content: string;
  status: TodoStatus;
}

export type DeepAgentStateType = z.infer<typeof DeepAgentState>;

export type LanguageModelLike = Runnable<
  BaseLanguageModelInput,
  LanguageModelOutput
>;

/**
 * Parameters for createDeepAgent function with TypeScript types
 */
export interface CreateDeepAgentParams<
  StateSchema extends z.ZodObject<any, any, any, any, any>,
> {
  tools?: StructuredTool[];
  instructions?: string;
  model?: LanguageModelLike;
  subagents?: SubAgent[];
  stateSchema?: StateSchema;
}

/**
 * Parameters for createTaskTool function
 */
export interface CreateTaskToolParams<
  StateSchema extends z.ZodObject<any, any, any, any, any>,
> {
  subagents: SubAgent[];
  tools?: Record<string, StructuredTool>;
  model?: LanguageModelLike;
  stateSchema?: StateSchema;
}

/**
 * Configuration for creating a language model.
 * This is a discriminated union type based on the `provider`.
 */
export type ModelConfig =
	| {
			provider: "gemini";
			model?: string;
			maxTokens?: number;
			apiKey?: string;
		}
	| {
			provider: "openai";
			model?: string;
			maxTokens?: number;
			apiKey?: string;
		}
	| {
			provider: "anthropic";
			model?: string;
			maxTokens?: number;
			apiKey?: string;
		}
	| {
			provider: "huggingface";
			model: string;
			maxTokens?: number;
			apiKey?: string;
		}
	| {
			/**
			 * Use a model from Hugging Face that runs directly in the browser
			 * using the `@huggingface/transformers` library. No API key is needed.
			 */
			provider: "huggingface-transformers";
			model?: string;
			maxTokens?: number;
		};
