// import { exec } from 'child_process';

// import { promisify } from 'util';

// const execAsync = promisify(exec);

// async function startTunnel() {
//   try {
//     console.log('Starting Cloudflare tunnel...');
//     const { stdout, stderr } = await execAsync('C:\\ngrok\\cloudflared.exe tunnel --url tcp://localhost:1433');
    
//     console.log('Tunnel created successfully!');
//     console.log('Output:', stdout);
    
//     if (stderr) {
//       console.error('Errors:', stderr);
//     }
//   } catch (error) {
//     console.error('Error creating tunnel:', error);
//   }
// }

// startTunnel(); 