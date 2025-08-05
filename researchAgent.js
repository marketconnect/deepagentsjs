import { createDeepAgent } from './src/index.js';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Search tool to use to do research
const internetSearch = tool(
    async ({
        query,
        maxResults = 5,
        topic = "general",
        includeRawContent = false
    }) => {
        /**
         * Run a web search using Tavily API
         */
        
        // Note: You'll need to install and import tavily-js or similar package
        // For now, this is a placeholder that shows the structure
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
            },
            body: JSON.stringify({
                query,
                max_results: maxResults,
                include_raw_content: includeRawContent,
                topic
            })
        });
        
        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }
        
        return await response.json();
    },
    {
        name: "internet_search",
        description: "Run a web search using Tavily API",
        schema: z.object({
            query: z.string().describe("The search query"),
            maxResults: z.number().optional().default(5).describe("Maximum number of results to return"),
            topic: z.enum(["general", "news", "finance"]).optional().default("general").describe("Search topic category"),
            includeRawContent: z.boolean().optional().default(false).describe("Whether to include raw content")
        })
    }
);

const subResearchPrompt = `You are a dedicated researcher. Your job is to conduct research based on the users questions.

Conduct thorough research and then reply to the user with a detailed answer to their question

only your FINAL answer will be passed on to the user. They will have NO knowledge of anything expect your final message, so your final report should be your final message!`;

const researchSubAgent = {
    name: "research-agent",
    description: "Used to research more in depth questions. Only give this researcher one topic at a time. Do not pass multiple sub questions to this researcher. Instead, you should break down a large topic into the necessary components, and then call multiple research agents in parallel, one for each sub question.",
    prompt: subResearchPrompt,
    tools: ["internet_search"]
};

const subCritiquePrompt = `You are a dedicated editor. You are being tasked to critique a report.

You can find the report at \`final_report.md\`.

You can find the question/topic for this report at \`question.txt\`.

The user may ask for specific areas to critique the report in. Respond to the user with a detailed critique of the report. Things that could be improved.

You can use the search tool to search for information, if that will help you critique the report

Do not write to the \`final_report.md\` yourself.

Things to check:
- Check that each section is appropriately named
- Check that the report is written as you would find in an essay or a textbook - it should be text heavy, do not let it just be a list of bullet points!
- Check that the report is comprehensive. If any paragraphs or sections are short, or missing important details, point it out.
- Check that the article covers key areas of the industry, ensures overall understanding, and does not omit important parts.
- Check that the article deeply analyzes causes, impacts, and trends, providing valuable insights
- Check that the article closely follows the research topic and directly answers questions
- Check that the article has a clear structure, fluent language, and is easy to understand.
`;

const critiqueSubAgent = {
    name: "critique-agent",
    description: "Used to critique the final report. Give this agent some information about how you want it to critique the report.",
    prompt: subCritiquePrompt,
};

// Prompt prefix to steer the agent to be an expert researcher
const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research, and then write a polished report.

You have access to a few tools.

## \`internet_search\`

You should use this to search for a question, and then return the results to the user.


`;

// Create the agent
const agent = createDeepAgent({
    tools: [internetSearch],
    instructions: researchInstructions,
    subagents: [critiqueSubAgent, researchSubAgent]
}).withConfig({ recursionLimit: 1000 });

// Example usage
async function main() {
    try {
        const result = await agent.invoke({
            messages: [{ role: "user", content: "what is langgraph?" }]
        });

        console.log(result);
    } catch (error) {
        console.error("Error running research agent:", error);
    }
}

// Export for use as module or run directly
export { agent, internetSearch, researchSubAgent, critiqueSubAgent };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}