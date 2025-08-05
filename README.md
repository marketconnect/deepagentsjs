# deepagentsjs

TypeScript implementation of Deep Agents - a library for building controllable AI agents with LangGraph.

## Installation

```bash
yarn install
```

## Build

```bash
yarn build
```

## Development

```bash
yarn dev
```

## Usage

### Basic Example

```typescript
import { createDeepAgent } from 'deepagentsjs';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Create a custom tool
const greetTool = tool(
  async (input) => {
    return `Hello, ${input.name}!`;
  },
  {
    name: "greet",
    description: "Greet someone by name",
    schema: z.object({
      name: z.string().describe("Name to greet"),
    }),
  }
);

// Create the agent
const agent = createDeepAgent({
  tools: [greetTool],
  instructions: "You are a helpful assistant that can greet people.",
});

// Use the agent
const result = await agent.invoke({
  messages: [{ role: "user", content: "Say hello to Alice" }]
});
```

### Parameters

- `tools` - Array of custom tools to add to the agent
- `instructions` - System instructions for the agent
- `model` - Language model to use (defaults to configured model)
- `subagents` - Array of sub-agents for task delegation
- `stateSchema` - Custom state schema (optional)

## Scripts

- `yarn build` - Build the project
- `yarn dev` - Start development mode with watch
- `yarn lint` - Run linting
- `yarn format` - Format code
- `yarn typecheck` - Run type checking 
