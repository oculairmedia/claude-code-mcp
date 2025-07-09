import fetch from 'node-fetch';

async function testMCP() {
  // First, initialize a session
  const initResponse = await fetch('http://192.168.50.90:3456/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      },
      id: 1
    })
  });

  console.log('Init response status:', initResponse.status);
  console.log('Init response headers:', [...initResponse.headers.entries()]);
  const initText = await initResponse.text();
  console.log('Init response:', initText);
  
  const sessionId = initResponse.headers.get('mcp-session-id');
  console.log('Session ID:', sessionId);
  
  if (!sessionId) {
    console.error('No session ID received');
    return;
  }

  // Now list tools
  const toolsResponse = await fetch('http://192.168.50.90:3456/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Mcp-Session-Id': sessionId
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 2
    })
  });

  const toolsText = await toolsResponse.text();
  console.log('Tools response text:', toolsText);
  
  let tools;
  try {
    tools = JSON.parse(toolsText);
    console.log('Tools response:', JSON.stringify(tools, null, 2));
  } catch (e) {
    console.error('Failed to parse tools response');
    return;
  }
  
  if (tools.result && tools.result.tools) {
    console.log('\nAvailable tools:');
    tools.result.tools.forEach(tool => {
      console.log(`- ${tool.name}`);
    });
  }
}

testMCP().catch(console.error);