/**
 * Simple test to verify the deepagents package works correctly
 */

require('dotenv').config();
const { createDeepAgent, writeTodos, readFile, writeFile, editFile, ls } = require('deepagents');

async function testDeepAgents() {
  console.log('🤖 Testing Deep Agents package...');
  
  try {
    // Test basic import and agent creation
    const agent = createDeepAgent({
      tools: [],
      instructions: "You are a helpful assistant. Simply respond to user messages politely."
    });

    console.log('✅ Successfully created Deep Agent');
    
    // Test basic functionality with a simple message
    const inputs = {
      messages: [
        { role: "user", content: "Hello! Just say hi back to confirm you're working." }
      ]
    };

    console.log('🔄 Testing agent response...');
    
    // Use streaming to get response
    const stream = await agent.stream(inputs, { streamMode: "values" });
    
    let responseReceived = false;
    let stepCount = 0;
    for await (const step of stream) {
      stepCount++;
      console.log(`Step ${stepCount}:`, JSON.stringify(step, null, 2));
      
      if (step.messages && step.messages.length > 0) {
        const lastMessage = step.messages[step.messages.length - 1];
        if (lastMessage.kwargs && lastMessage.id && lastMessage.id.includes('AIMessage')) {
          console.log('🤖 Agent response:', lastMessage.kwargs.content);
          responseReceived = true;
        }
      }
    }
    
    if (responseReceived) {
      console.log('✅ Package test completed successfully!');
    } else {
      console.log('⚠️  No response received from agent');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testDeepAgents();