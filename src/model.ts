/**
 * Model configuration for Deep Agents
 *
 * This module provides functions for creating and configuring language models for Deep Agents.
 * It supports various providers like Anthropic, OpenAI, Google Gemini, and Hugging Face.
 */

import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import type { LanguageModelLike, ModelConfig } from "./types.js";

/**
 * Create a language model instance based on the provided configuration.
 * This function allows for easy instantiation of models from different providers
 * without needing to import them directly. It's designed for use in browser
 * environments where API keys are provided dynamically.
 *
 * @param config The model configuration object.
 * @returns A language model instance (`LanguageModelLike`).
 */
export function createModel(config: ModelConfig): LanguageModelLike {
	const { provider } = config;
	const maxTokens = config.maxTokens ?? 4096;
	const apiKey = config.apiKey;

	switch (provider) {
		case "anthropic":
			return new ChatAnthropic({
				model: config.model ?? "claude-3-5-sonnet-20240620",
				maxTokens,
				apiKey,
			});
		case "openai":
			return new ChatOpenAI({
				model: config.model ?? "gpt-4o",
				maxTokens,
				apiKey,
			});
		case "gemini":
			return new ChatGoogleGenerativeAI({
				model: config.model ?? "gemini-1.5-flash",
				maxOutputTokens: maxTokens,
				apiKey,
			});
		case "huggingface":
			return new HuggingFaceInference({
				model: config.model,
				apiKey,
				maxTokens,
			});
		default:
			// This case should be unreachable with TypeScript's discriminated union
			throw new Error(`Unsupported model provider.`);
	}
}

/**
 * Throws an error indicating that a model must be explicitly provided.
 * The default model has been removed to prevent reliance on environment variables
 * for API keys, which is insecure in browser environments.
 */
export function getDefaultModel(): LanguageModelLike {
	throw new Error(
		"A model must be provided to createDeepAgent. There is no default model.\nTo fix, you can import and use the `createModel` function to configure a model.\n\nExample:\nimport { createDeepAgent, createModel } from 'deepagents';\n\nconst model = createModel({ provider: 'openai', apiKey: 'YOUR_API_KEY' });\nconst agent = createDeepAgent({ model });",
	);
}
