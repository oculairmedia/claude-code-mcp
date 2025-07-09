#!/usr/bin/env node
/**
 * Test script for direct Matrix messaging
 */

import dotenv from 'dotenv';
import { MatrixBotService, createMatrixBotFromEnv } from './dist/matrix-client.js';

// Load environment variables
dotenv.config();

async function testDirectMatrix() {
  console.log('Testing direct Matrix messaging...\n');

  try {
    // Create and initialize Matrix bot
    console.log('Creating Matrix bot...');
    const matrixBot = createMatrixBotFromEnv();
    
    console.log('Initializing Matrix bot...');
    await matrixBot.initialize();
    console.log('✅ Matrix bot initialized successfully!\n');
    
    // Test room ID from our created test room
    const testRoomId = '!noyiwLRleXMTeugOyc:matrix.oculair.ca';
    
    console.log(`Attempting to send message to room: ${testRoomId}`);
    console.log('Note: Replace the room ID above with an actual Matrix room ID where the bot is invited.\n');
    
    // Create a test job result
    const jobResult = {
      taskId: 'test_' + Date.now(),
      agentId: 'test-agent-123',
      success: true,
      result: 'This is a direct test of the Matrix bot functionality.\n\nIf you see this message, the Matrix integration is working!',
      timestamp: new Date()
    };
    
    // Try to send a message (will fail if room ID is invalid)
    try {
      await matrixBot.sendJobResult(testRoomId, jobResult);
      console.log('✅ Message sent successfully!');
    } catch (error) {
      console.log('❌ Failed to send message:', error.message);
      console.log('\nThis is expected if the room ID is invalid or the bot is not in the room.');
      console.log('To test properly:');
      console.log('1. Create a Matrix room');
      console.log('2. Invite @claudecode:matrix.oculair.ca to the room');
      console.log('3. Replace the testRoomId in this script with your room ID');
      console.log('4. Run this script again');
    }
    
    // Stop the bot
    await matrixBot.stop();
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDirectMatrix().catch(console.error);