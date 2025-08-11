import { execSync } from "child_process";
import https from "https";

// Configura tus valores
const config = {
  resourceGroup: "cibeles",           // 🔁 Reemplaza por el nombre de tu grupo de recursos
  serverName: "testeto",              // 🔁 Nombre de tu servidor SQL (sin .database.windows.net)
  ruleName: "DevIP",                  // Puedes cambiar el nombre de la regla
  startIp: null,
  endIp: null,
};

// Función para obtener tu IP pública
function getMyIP() {
  return new Promise((resolve, reject) => {
    https.get("https://api.ipify.org", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data.trim()));
    }).on("error", (err) => reject(err));
  });
}

// Agrega IP al firewall
async function addIpRule() {
  try {
    const ip = await getMyIP();
    config.startIp = ip;
    config.endIp = ip;

    console.log(`🚀 Agregando IP ${ip} al firewall de ${config.serverName}...`);

    const command = `az sql server firewall-rule create \
      --resource-group ${config.resourceGroup} \
      --server ${config.serverName} \
      --name ${config.ruleName} \
      --start-ip-address ${config.startIp} \
      --end-ip-address ${config.endIp}`;

    const output = execSync(command, { encoding: "utf-8" });
    console.log("✅ IP agregada exitosamente:\n", output);
  } catch (err) {
    console.error("❌ Error al agregar la IP:", err.message || err);
  }
}

addIpRule();
