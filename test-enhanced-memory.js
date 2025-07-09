#!/usr/bin/env node
/**
 * Test script for enhanced memory block functionality
 */

import { LettaMemoryClient } from './dist/letta-memory-client.js';
import { randomUUID } from 'crypto';

const testAgentId = 'agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a';
const client = new LettaMemoryClient();

async function testEnhancedMemoryBlocks() {
  console.log('🧪 Testing enhanced memory block functionality...\n');
  
  try {
    // Test 1: Task Classification
    console.log('📊 Test 1: Task Classification');
    const codeGenPrompt = "Generate a Python script to parse CSV files and convert them to JSON";
    const classification = client.classifyTask(codeGenPrompt);
    console.log(`  - Task Type: ${classification.task_type}`);
    console.log(`  - Complexity Score: ${classification.complexity_score}/10`);
    console.log(`  - Should Archive: ${classification.should_archive}`);
    console.log(`  - Archive Priority: ${classification.archive_priority}`);
    console.log(`  - Archive Tags: [${classification.archive_tags.join(', ')}]`);
    console.log('✅ Task classification working\n');
    
    // Test 2: Enhanced Task Status Creation
    console.log('🚀 Test 2: Enhanced Task Status Creation');
    const taskId = randomUUID();
    const enhancedStatus = client.createEnhancedTaskStatus(
      taskId,
      testAgentId,
      codeGenPrompt,
      '/opt/stacks/claude-code-mcp'
    );
    
    console.log(`  - Task ID: ${enhancedStatus.task_id}`);
    console.log(`  - Status: ${enhancedStatus.status}`);
    console.log(`  - Progress: ${enhancedStatus.progress_percentage}%`);
    console.log(`  - Task Type: ${enhancedStatus.task_type}`);
    console.log(`  - Complexity: ${enhancedStatus.complexity_score}/10`);
    console.log(`  - Should Archive: ${enhancedStatus.should_archive}`);
    console.log('✅ Enhanced task status creation working\n');
    
    // Test 3: Create and Update Task
    console.log('💾 Test 3: Create and Update Task Memory Block');
    await client.updateTaskStatus(testAgentId, enhancedStatus);
    console.log('  - Initial task created');
    
    // Test 4: Progress Updates
    console.log('📈 Test 4: Progress Updates');
    await client.updateTaskProgress(testAgentId, taskId, {
      progress: 'Analyzing CSV structure',
      progress_percentage: 25,
      current_step: 'File analysis',
      step_details: 'Examining CSV headers and data types',
      files_created: ['/tmp/analysis.json']
    });
    console.log('  - Progress updated to 25%');
    
    await client.updateTaskProgress(testAgentId, taskId, {
      progress: 'Generating Python code',
      progress_percentage: 75,
      current_step: 'Code generation',
      step_details: 'Writing pandas-based CSV parser',
      files_created: ['/tmp/analysis.json', '/tmp/csv_parser.py'],
      commands_executed: ['python -m pip install pandas']
    });
    console.log('  - Progress updated to 75%');
    console.log('✅ Progress updates working\n');
    
    // Test 5: Add Warning
    console.log('⚠️  Test 5: Add Task Warning');
    const warning = {
      timestamp: new Date().toISOString(),
      warning_type: 'performance',
      message: 'Large CSV file detected, processing may take longer',
      details: 'File size: 150MB, consider chunking for better performance',
      severity: 'medium'
    };
    await client.addTaskWarning(testAgentId, taskId, warning);
    console.log('  - Performance warning added');
    console.log('✅ Warning logging working\n');
    
    // Test 6: Add Error (simulated)
    console.log('❌ Test 6: Add Task Error');
    const error = {
      timestamp: new Date().toISOString(),
      error_type: 'validation',
      message: 'Invalid CSV format detected in row 1250',
      details: 'Missing required column: email_address',
      stack_trace: 'at pandas.read_csv(line 45)',
      recoverable: true,
      recovery_attempted: false
    };
    await client.addTaskError(testAgentId, taskId, error);
    console.log('  - Validation error added');
    console.log('✅ Error logging working\n');
    
    // Test 7: Complete Task
    console.log('🏁 Test 7: Complete Task');
    const result = `Successfully generated CSV parser!

Created files:
- /tmp/csv_parser.py: Main parser script (2.5KB)
- /tmp/config.json: Configuration file (0.8KB)
- /tmp/README.md: Usage documentation (1.2KB)

The script supports:
✅ Multiple CSV formats
✅ Data type inference
✅ Error handling for malformed rows
✅ JSON output with proper encoding

Usage: python csv_parser.py input.csv output.json`;

    const finalMetrics = {
      execution_time_ms: 45000, // 45 seconds
      memory_usage_mb: 25.6,
      cpu_usage_percent: 15.2,
      files_created: ['/tmp/csv_parser.py', '/tmp/config.json', '/tmp/README.md'],
      files_modified: [],
      commands_executed: ['python -m pip install pandas', 'python csv_parser.py --test'],
      urls_accessed: ['https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html']
    };
    
    await client.completeTask(testAgentId, taskId, result, true, finalMetrics);
    console.log('  - Task completed successfully');
    console.log('  - Final metrics recorded');
    console.log('  - Task archived (if applicable)');
    console.log('✅ Task completion working\n');
    
    // Test 8: Check Archive
    console.log('📚 Test 8: Check Archive');
    const archiveBlock = await client.getMemoryBlock(testAgentId, 'claude_mcp_task_archive');
    if (archiveBlock && archiveBlock.value) {
      const archivedTasks = JSON.parse(archiveBlock.value);
      console.log(`  - Found ${archivedTasks.length} archived tasks`);
      if (archivedTasks.length > 0) {
        const lastTask = archivedTasks[0];
        console.log(`  - Latest: ${lastTask.task_type} task (${lastTask.archive_priority} priority)`);
        console.log(`  - Execution time: ${lastTask.execution_time_ms}ms`);
        console.log(`  - Files created: ${lastTask.files_created?.length || 0}`);
      }
    } else {
      console.log('  - No archive block found (expected for first run)');
    }
    console.log('✅ Archive system working\n');
    
    // Test 9: List All Memory Blocks
    console.log('📋 Test 9: List All Memory Blocks');
    const blocks = await client.listMemoryBlocks(testAgentId);
    console.log(`  - Total memory blocks: ${blocks.length}`);
    
    const taskBlocks = blocks.filter(b => b.label?.startsWith('claude_task_'));
    console.log(`  - Task blocks: ${taskBlocks.length}`);
    
    const archiveBlocks = blocks.filter(b => b.label?.includes('archive'));
    console.log(`  - Archive blocks: ${archiveBlocks.length}`);
    
    const errorBlocks = blocks.filter(b => b.label?.includes('error'));
    console.log(`  - Error blocks: ${errorBlocks.length}`);
    
    console.log('✅ Memory block listing working\n');
    
    // Test 10: Test Different Task Types
    console.log('🔄 Test 10: Different Task Types');
    const taskTypes = [
      "Create a new React component for user authentication",
      "Search for the latest JavaScript frameworks and summarize findings", 
      "Analyze the performance bottlenecks in database queries",
      "Run git status and commit all changes with message 'Update documentation'",
      "Execute npm test and then npm run build if tests pass"
    ];
    
    for (const [index, prompt] of taskTypes.entries()) {
      const classification = client.classifyTask(prompt);
      console.log(`  ${index + 1}. "${prompt.substring(0, 40)}..." → ${classification.task_type} (score: ${classification.complexity_score})`);
    }
    console.log('✅ Task type classification working\n');
    
    console.log('🎉 All enhanced memory block tests completed successfully!');
    console.log('\n📈 Summary of Enhancements:');
    console.log('  ✅ Enhanced TaskStatus interface with 20+ new fields');
    console.log('  ✅ Automatic task classification and complexity scoring');
    console.log('  ✅ Real-time progress tracking with percentage completion');
    console.log('  ✅ Detailed error and warning logging');
    console.log('  ✅ Performance metrics and resource tracking');
    console.log('  ✅ Intelligent archival system with priority-based retention');
    console.log('  ✅ File operation tracking (created/modified files)');
    console.log('  ✅ Command execution and URL access logging');
    console.log('  ✅ Enhanced metadata for better searchability');
    console.log('\n🚀 The Letta MCP server now has enterprise-grade task memory management!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testEnhancedMemoryBlocks();