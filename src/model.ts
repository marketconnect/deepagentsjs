/**
 * Model configuration for Deep Agents
 *
 * Default model configuration matching the Python implementation exactly.
 * Returns a ChatAnthropic instance configured with claude-sonnet-4-20250514 and maxTokens: 64000.
 */

import { ChatAnthropic } from "@langchain/anthropic";

/**
 * Get the default model for Deep Agents
 *
 * Returns a ChatAnthropic instance configured exactly like the Python version:
 * - model: "claude-sonnet-4-20250514"
 * - maxTokens: 64000
 *
 * @returns ChatAnthropic instance with default configuration
 */
export function getDefaultModel(): ChatAnthropic {
  return new ChatAnthropic({
    model: "claude-sonnet-4-20250514",
    maxTokens: 4096, // Reduced from 64000 to prevent timeout issues
  });
}
