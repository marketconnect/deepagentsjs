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
import { LLM, type BaseLLMParams } from "@langchain/core/language_models/llms";
import type { LanguageModelLike, ModelConfig } from "./types.js";

/**
 * Dynamically imports the Hugging Face Transformers library.
 * This is done to avoid making it a hard dependency for users who don't need it.
 * @returns The pipeline function from the library.
 */
async function getHuggingFaceTransformers() {
	try {
		const { pipeline, env } = await import("@huggingface/transformers");
		// Configure environment for browser-friendly behavior
		(env as any).allowLocalModels = false; // Disallow access to local file system
		(env as any).useBrowserCache = true; // Cache models in the browser's cache
		return { pipeline };
	} catch (e) {
		throw new Error(
			"The '@huggingface/transformers' package is required for the 'huggingface-transformers' provider. Please install it with `npm install @huggingface/transformers`.",
		);
	}
}

interface HuggingFaceTransformersLLMParams extends BaseLLMParams {
	model?: string;
	maxTokens?: number;
}

/**
 * A custom LangChain LLM that uses the `@huggingface/transformers` library
 * to run models directly in the browser.
 */
class HuggingFaceTransformersLLM
	extends LLM
	implements HuggingFaceTransformersLLMParams
{
	model: string;
	maxTokens?: number;

	private generator: any | null = null; // The pipeline function

	constructor(fields?: HuggingFaceTransformersLLMParams) {
		super(fields ?? {});
		this.model = fields?.model ?? "Xenova/gpt2"; // A reasonable default for text generation
		this.maxTokens = fields?.maxTokens;
	}

	_llmType(): string {
		return "huggingface_transformers_js";
	}

	private async initializeGenerator() {
		if (this.generator) {
			return;
		}
		const { pipeline } = await getHuggingFaceTransformers();
		this.generator = await pipeline("text-generation", this.model);
	}

	async _call(
		prompt: string,
		_options: this["ParsedCallOptions"],
	): Promise<string> {
		await this.initializeGenerator();

		const result = await this.generator(prompt, {
			max_new_tokens: this.maxTokens,
			return_full_text: false,
		});

		if (
			Array.isArray(result) &&
			result[0] &&
			typeof result[0].generated_text === "string"
		) {
			return result[0].generated_text;
		}

		throw new Error("Unexpected response format from Hugging Face pipeline.");
	}
}

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
	const apiKey = (config as any).apiKey;

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
				model: config.model as string,
				apiKey,
				maxTokens,
			});
		case "huggingface-transformers":
			return new HuggingFaceTransformersLLM({
				model: config.model,
				maxTokens: config.maxTokens,
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
