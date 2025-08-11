import localtunnel from 'localtunnel';

async function startTunnel() {
  try {
    const tunnel = await localtunnel({
      port: 1433,
      subdomain: 'fotvadmin',
      host: 'https://localtunnel.me',
      allow_invalid_cert: true
    });

    console.log('Tunnel created successfully!');
    console.log('Public URL:', tunnel.url);
    console.log('\nFull connection string:');
    console.log(`sqlserver://${tunnel.url.replace('https://', '')}:1433;database=fotvAdmin;integratedSecurity=false;username=sa;password=as;trustServerCertificate=true;Connection Timeout=50;Query Timeout=50`);
    console.log('\nIMPORTANT: Keep this window open to maintain the tunnel active!');

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });

    tunnel.on('error', err => {
      console.error('Tunnel error:', err);
    });
  } catch (error) {
    console.error('Error creating tunnel:', error);
  }
}

startTunnel(); 