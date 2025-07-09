#!/usr/bin/env node
/**
 * Demonstration of enhanced Letta MCP integration
 * Shows how the improved memory block system works with real Claude Code execution
 */

import { LettaMemoryClient } from './dist/letta-memory-client.js';

const testAgentId = 'agent-demo-12345';
const client = new LettaMemoryClient();

async function demonstrateEnhancedIntegration() {
  console.log('🎭 Claude Code MCP Enhanced Memory Block Integration Demo\n');
  
  console.log('📋 Enhanced Features Showcase:');
  console.log('   🎯 Automatic task classification and complexity scoring');
  console.log('   📊 Real-time progress tracking with detailed metrics');
  console.log('   🔍 Comprehensive error and warning management');
  console.log('   📈 Performance monitoring and resource tracking');
  console.log('   🗄️  Intelligent archival with priority-based retention');
  console.log('   🏷️  Smart tagging and categorization');
  console.log('   📁 File operation tracking (created, modified, accessed)');
  console.log('   ⚡ Command execution and URL access logging\n');
  
  try {
    // Demonstrate different task types and their classifications
    const taskExamples = [
      {
        prompt: "Create a React component with TypeScript for user authentication, include tests, and update documentation",
        description: "Complex multi-step code generation task"
      },
      {
        prompt: "Search GitHub for the top 10 machine learning libraries and create a comparison table",
        description: "Research and analysis task"
      },
      {
        prompt: "Fix the bug in app.js line 42 where the login validation fails",
        description: "Simple file operation task"
      },
      {
        prompt: "Run the test suite, analyze failures, fix issues, then commit and push to feature branch",
        description: "Complex multi-step workflow"
      },
      {
        prompt: "Generate API documentation from code comments using JSDoc",
        description: "Code analysis and documentation task"
      }
    ];
    
    console.log('🔬 Task Classification Examples:\n');
    
    for (const [index, example] of taskExamples.entries()) {
      const classification = client.classifyTask(example.prompt);
      
      console.log(`${index + 1}. ${example.description}`);
      console.log(`   Prompt: "${example.prompt}"`);
      console.log(`   🏷️  Type: ${classification.task_type}`);
      console.log(`   📊 Complexity: ${classification.complexity_score}/10`);
      console.log(`   📚 Archive Priority: ${classification.archive_priority}`);
      console.log(`   🏷️  Tags: [${classification.archive_tags.join(', ')}]`);
      console.log(`   💾 Should Archive: ${classification.should_archive ? '✅' : '❌'}\n`);
    }
    
    // Show memory block structure
    console.log('📋 Enhanced Memory Block Structure:');
    const sampleTask = client.createEnhancedTaskStatus(
      'demo-task-123',
      testAgentId,
      taskExamples[0].prompt,
      '/workspace/my-project'
    );
    
    console.log('```json');
    console.log(JSON.stringify({
      // Show key fields for demo
      task_id: sampleTask.task_id,
      agent_id: sampleTask.agent_id,
      status: sampleTask.status,
      task_type: sampleTask.task_type,
      complexity_score: sampleTask.complexity_score,
      progress_percentage: sampleTask.progress_percentage,
      estimated_completion: sampleTask.estimated_completion,
      should_archive: sampleTask.should_archive,
      archive_priority: sampleTask.archive_priority,
      archive_tags: sampleTask.archive_tags,
      working_directory: sampleTask.working_directory,
      errors: sampleTask.errors,
      warnings: sampleTask.warnings,
      '...': 'plus 15+ additional tracking fields'
    }, null, 2));
    console.log('```\n');
    
    // Show API integration
    console.log('🔗 Integration with Letta API:');
    console.log('   📡 Base URL: https://letta2.oculair.ca');
    console.log('   🔐 Authentication: Bearer token + X-BARE-PASSWORD');
    console.log('   📋 Memory Blocks: /v1/agents/{agentId}/core-memory/blocks');
    console.log('   📎 Block Attachment: /v1/agents/{agentId}/core-memory/blocks/attach/{blockId}');
    console.log('   🔄 Real-time Updates: Automatic progress streaming during execution\n');
    
    // Show usage in Claude Code
    console.log('🛠️  Usage in Claude Code MCP Server:');
    console.log(`
   // When agent calls claude_code tool with agentId
   const taskStatus = memoryClient.createEnhancedTaskStatus(taskId, agentId, prompt, workDir);
   await memoryClient.updateTaskStatus(agentId, taskStatus);
   
   // During execution - real-time progress updates
   await memoryClient.updateTaskProgress(agentId, taskId, {
     progress_percentage: 50,
     current_step: 'Processing files',
     step_details: 'Analyzing React components...',
     files_created: ['NewComponent.tsx', 'NewComponent.test.tsx']
   });
   
   // On completion - final metrics and archival
   await memoryClient.completeTask(agentId, taskId, result, success, {
     execution_time_ms: 45000,
     files_created: ['Component.tsx', 'Component.test.tsx', 'README.md'],
     commands_executed: ['npm test', 'npm run lint']
   });
    `);
    
    console.log('📊 Benefits for Letta Agents:');
    console.log('   🧠 Persistent memory of all Claude Code tasks');
    console.log('   📈 Detailed progress tracking for long-running operations');
    console.log('   🔍 Searchable task history with intelligent categorization');  
    console.log('   ⚡ Performance insights and resource usage analytics');
    console.log('   🛡️  Comprehensive error tracking and recovery information');
    console.log('   🎯 Automatic task complexity assessment for better planning');
    console.log('   📚 Priority-based archival ensuring important tasks are retained');
    console.log('   🏷️  Smart tagging system for easy task retrieval\n');
    
    console.log('🎉 The enhanced Letta MCP integration provides enterprise-grade');
    console.log('   task memory management, enabling Letta agents to have persistent,');
    console.log('   searchable, and intelligent memory of all Claude Code operations!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
demonstrateEnhancedIntegration();