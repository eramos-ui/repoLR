# Configuración de FRP para Conexión Remota a SQL Server

## Requisitos Previos
- SQL Server 2019 instalado y funcionando localmente
- Node.js y npm instalados
- Proyecto Next.js configurado

# "dev": "node add-ip-to-azure-sql.js && next dev ", 

## Instalación de FRP

1. Descargar FRP versión 0.61.2 desde:
   https://github.com/fatedier/frp/releases/download/v0.61.2/frp_0.61.2_windows_amd64.zip

2. Crear carpeta en C:\frp
3. Descomprimir el contenido del zip en C:\frp
4. Verificar que existan los archivos:
   - frps.exe
   - frpc.exe

## Configuración

### 1. Archivo de configuración del servidor (scripts/frp.ini)
```ini
[common]
bind_port = 7000
bind_addr = 0.0.0.0
token = 12345678

[sqlserver]
type = tcp
local_ip = 127.0.0.1
local_port = 1433
remote_port = 1433
```

### 2. Archivo de configuración del cliente (scripts/frpc.ini)
```ini
[common]
server_addr = 127.0.0.1
server_port = 7000
token = 12345678

[sqlserver]
type = tcp
local_ip = 127.0.0.1
local_port = 1433
remote_port = 1433
```

### 3. Configuración del .env
```env
DATABASE_URL="sqlserver://127.0.0.1:1433;database=fotvAdmin;integratedSecurity=false;username=sa;password=as;trustServerCertificate=true;Connection Timeout=50;Query Timeout=50"
```

## Script de Inicio Automático

Se ha creado un archivo `start.bat` que inicia todos los componentes necesarios:

```batch
@echo off
echo Iniciando servidor FRP...
start "FRP Server" cmd /k "cd C:\frp && C:\frp\frps.exe -c D:\nextProject\voltAdmin\scripts\frp.ini"

echo Iniciando cliente FRP...
start "FRP Client" cmd /k "cd D:\nextProject\voltAdmin && npm run frp"

echo Iniciando aplicación Next.js...
cd D:\nextProject\voltAdmin
npm run dev
```

## Uso

1. Ejecutar `start.bat` haciendo doble clic
2. Se abrirán tres ventanas de comando:
   - Servidor FRP
   - Cliente FRP
   - Aplicación Next.js
3. Acceder a la aplicación en http://localhost:3000

## Detención

Para detener todos los servicios:
1. Cerrar las tres ventanas de comando
2. O presionar Ctrl+C en cada una de ellas

## Solución de Problemas

1. Verificar que SQL Server esté ejecutándose
2. Comprobar que los puertos 1433 y 7000 no estén bloqueados
3. Verificar que las credenciales de SQL Server sean correctas
4. Asegurarse de que todos los archivos de configuración estén en las ubicaciones correctas

## Notas Importantes
- Mantener las ventanas de comando abiertas mientras se use la aplicación
- El servidor FRP debe iniciarse antes que el cliente
- La aplicación Next.js debe iniciarse después de que FRP esté funcionando 
## Para convertir MSSQL a MongoDB
- Crear la collection en MongoDB
- Hacer el query que contiene los array de JSON para poblar en MSSM
- Abrir en la collection el Mongosh
- hacer el insert sb.xxxx.insertMany () de array de jsones del MSSM