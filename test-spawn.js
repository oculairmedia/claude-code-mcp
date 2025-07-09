import { spawn } from 'child_process';

// Test 1: Simple echo command
console.log('Test 1: Simple echo');
const echo = spawn('echo', ['hello', 'world']);
echo.stdout.on('data', (data) => console.log('Echo output:', data.toString()));
echo.stderr.on('data', (data) => console.error('Echo error:', data.toString()));
echo.on('exit', (code) => console.log('Echo exited with code:', code));

// Test 2: Claude with arguments
setTimeout(() => {
  console.log('\nTest 2: Claude with arguments');
  const claude = spawn('claude', ['--print', '-p', 'echo test']);
  
  console.log('Claude PID:', claude.pid);
  console.log('Claude spawnfile:', claude.spawnfile);
  console.log('Claude spawnargs:', claude.spawnargs);
  
  claude.stdout.on('data', (data) => console.log('Claude output:', data.toString()));
  claude.stderr.on('data', (data) => console.error('Claude error:', data.toString()));
  claude.on('exit', (code) => {
    console.log('Claude exited with code:', code);
    process.exit(0);
  });
  
  // Send newline to stdin
  if (claude.stdin) {
    claude.stdin.write('\n');
  }
  
  // Kill after 10 seconds if still running
  setTimeout(() => {
    if (!claude.killed) {
      console.log('Killing claude process after timeout');
      claude.kill();
    }
  }, 10000);
}, 1000);