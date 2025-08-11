import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startTunnel() {
  try {
    console.log('Iniciando túnel FRP...');
    const configPath = path.join(__dirname, 'frpc.ini');
    const { stdout, stderr } = await execAsync(`C:\\frp\\frpc.exe -c "${configPath}"`);
    
    console.log('Túnel creado exitosamente!');
    console.log('Salida:', stdout);
    
    if (stderr) {
      console.error('Errores:', stderr);
    }
  } catch (error) {
    console.error('Error al crear el túnel:', error);
  }
}

startTunnel(); 