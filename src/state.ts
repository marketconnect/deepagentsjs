/**
 * State definitions for Deep Agents
 *
 * TypeScript equivalents of the Python state classes using LangGraph's Annotation.Root() pattern.
 * Defines Todo interface and DeepAgentState using MessagesAnnotation as base with proper reducer functions.
 */

import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import type { Todo } from "./types.js";

/**
 * File reducer function that merges file dictionaries
 * Matches the Python file_reducer function behavior exactly
 */
export function fileReducer(
  left: Record<string, string> | null | undefined,
  right: Record<string, string> | null | undefined,
): Record<string, string> {
  if (left == null) {
    return right || {};
  } else if (right == null) {
    return left;
  } else {
    return { ...left, ...right };
  }
}

/**
 * Todo reducer function that replaces the entire todo list
 * This matches the Python behavior where todos are completely replaced
 */
export function todoReducer(
  left: Todo[] | null | undefined,
  right: Todo[] | null | undefined,
): Todo[] {
  if (right != null) {
    return right;
  }
  return left || [];
}

/**
 * DeepAgentState using LangGraph's Annotation.Root() pattern
 * Extends MessagesAnnotation (equivalent to Python's AgentState) with todos and files channels
 */
export const DeepAgentState = Annotation.Root({
  // Inherit all fields from MessagesAnnotation (messages channel with proper reducer)
  ...MessagesAnnotation.spec,

  // Add todos channel - optional list of Todo items
  todos: Annotation<Todo[]>({
    reducer: todoReducer,
    default: () => [],
  }),

  // Add files channel - optional dictionary of file paths to content
  files: Annotation<Record<string, string>>({
    reducer: fileReducer,
    default: () => ({}),
  }),
});
