import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function startTunnel() {
  try {
    console.log('Starting ngrok tunnel...');
    const { stdout, stderr } = await execAsync('C:\\ngrok\\ngrok.exe tcp 1433');
    
    console.log('Tunnel created successfully!');
    console.log('Output:', stdout);
    
    if (stderr) {
      console.error('Errors:', stderr);
    }
  } catch (error) {
    console.error('Error creating tunnel:', error);
  }
}

startTunnel(); 