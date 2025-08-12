# 🧠🤖Deep Agents

Using an LLM to call tools in a loop is the simplest form of an agent. This architecture, however, can yield agents that are "shallow" and fail to plan and act over longer, more complex tasks. Applications like "Deep Research", "Manus", and "Claude Code" have gotten around this limitation by implementing a combination of four things: a planning tool, sub agents, access to a file system, and a detailed prompt.

`deepagents` is a TypeScript package that implements these in a general purpose way so that you can easily create a Deep Agent for your application.

> ![TIP]
> Looking for the Python version of this package? See [here: hwchase17/deepagents](https://github.com/hwchase17/deepagents)

**Acknowledgements**: This project was primarily inspired by Claude Code, and initially was largely an attempt to see what made Claude Code general purpose, and make it even more so.

## Installation

```bash
yarn add deepagents
```

## Learn more

For more information, check out our docs: [link]
