#!/usr/bin/env node
/**
 * Test script for Matrix integration
 */

import dotenv from 'dotenv';
import { sendResultToLetta } from './dist/letta-callback.js';

// Load environment variables
dotenv.config();

async function testMatrixIntegration() {
  console.log('Testing Matrix integration...\n');

  const testData = {
    agentId: 'agent-4bea3f4e-ecf7-40d3-871d-4c52595d60a1',
    taskId: 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    callbackUrl: 'https://letta.oculair.ca',
    result: 'This is a test message from Claude Code MCP Matrix integration test.\n\nThe integration is working correctly if you see this message in your Matrix room!',
    success: true
  };

  console.log('Test data:', JSON.stringify(testData, null, 2));
  console.log('\nSending test message...');

  try {
    await sendResultToLetta(testData);
    console.log('\n✅ Test completed successfully!');
    console.log('Check your Matrix room for the test message.');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

testMatrixIntegration().catch(console.error);