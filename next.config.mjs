// import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone'
};
export default nextConfig;
// const nextConfig = {
//   images: {
//     domains: ['firebasestorage.googleapis.com'],
//   },

//   webpack: (config, { isServer, dev, webpack }) => {
//     if (!isServer) {
//       config.plugins.push(new NodePolyfillPlugin());

//       config.resolve.alias = {
//         ...config.resolve.alias,
//         url: require.resolve('url/'),
//         // agrega más aliases si los tienes
//       };

//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         // fallbacks necesarios
//       };

//       config.plugins.push(
//         new webpack.ProvidePlugin({
//           process: 'process/browser',
//           Buffer: ['buffer', 'Buffer'],
//         })
//       );

//       config.ignoreWarnings = [
//         /Critical dependency/,
//         /UnhandledSchemeError/,
//       ];
//     }

//     return config;
//   },
// };

//export default nextConfig;



// webpack: (config, { isServer, dev, webpack }) => {
//   if (!isServer) {
//     config.plugins.push(new NodePolyfillPlugin());

//     config.resolve.alias = {
//       ...config.resolve.alias,
//       'url': require.resolve('url/'),
//       // ... los otros aliases
//     };

//     config.resolve.fallback = {
//       ...config.resolve.fallback,
//       // fallbacks necesarios
//     };

//     config.plugins.push(
//       new webpack.ProvidePlugin({
//         process: 'process/browser',
//         Buffer: ['buffer', 'Buffer'],
//       })
//     );

//     config.ignoreWarnings = [
//       /Critical dependency/,
//       /UnhandledSchemeError/,
//     ];
//   }

//   return config;
// }

 




// // En lugar de importar webpack directamente, lo obtendremos de la compilación de Next.js
// import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
// import { createRequire } from 'module';

// // Permitir imports de CommonJS en ESM
// const require = createRequire(import.meta.url);
// const withTM = require('next-transpile-modules')(['tedious', 'mssql', '@prisma/client']);

// const nextConfig = {
//   // Desactivar opciones experimentales en nextjs 14 para compatibilidad
//   experimental: {
//     serverComponentsExternalPackages: ['tedious', 'mssql'],
//     esmExternals: 'loose',  // Para manejar correctamente módulos ESM externos
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost', // O el dominio de tu servidor
//         port: '3000', // Puerto si estás en desarrollo
//         pathname: '/api/getAvatar',
//       },
//       {
//         protocol: 'https',
//         hostname: 'via.placeholder.com', // Reemplazar con mi dominio
//         pathname: '/avatars/**',   // Ruta relativa donde están tus avatares
//       }
//     ],
//   },
//   webpack: (config, { isServer, dev, webpack }) => {
//     // Configurar reglas para CSS/PostCSS - asegurarse que Next.js las procese correctamente
//     if (!isServer) {
//       // Usar NodePolyfillPlugin para manejar los URIs tipo "node:"
//       config.plugins.push(new NodePolyfillPlugin());
      
//       // Configurar reglas para procesar CSS y Tailwind
//       config.module.rules.push({
//         test: /\.css$/,
//         use: [
//           'style-loader',
//           'css-loader',
//           'postcss-loader'
//         ],
//       });
      
//       // Configuración específica para resolver módulos con prefijo 'node:'
//       config.resolve.alias = {
//         ...config.resolve.alias,
//         'url': require.resolve('url/'),
//         'events': require.resolve('events/'),
//         'stream': require.resolve('stream-browserify'),
//         'buffer': require.resolve('buffer/'),
//         'util': require.resolve('util/'),
//         'process': require.resolve('process/browser'),
//         'path': require.resolve('path-browserify'),
//         'fs': false,
//         'crypto': require.resolve('crypto-browserify'),
//         'http': require.resolve('stream-http'),
//         'https': require.resolve('https-browserify'),
//         'zlib': require.resolve('browserify-zlib'),
//         'assert': require.resolve('assert/'),
//         'net': false,
//         'tls': false,
//         'dgram': false,
//         'dns': false,
//         'child_process': false,
//         'cluster': false,
//         'os': false,
//       };

//       // Fallbacks para módulos que no tienen equivalente en el navegador
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false,
//         path: require.resolve('path-browserify'),
//         crypto: require.resolve('crypto-browserify'),
//         stream: require.resolve('stream-browserify'),
//         buffer: require.resolve('buffer'),
//         util: require.resolve('util'),
//         process: require.resolve('process/browser'),
//         events: require.resolve('events'),
//         assert: require.resolve('assert'),
//         url: require.resolve('url'),
//         http: require.resolve('stream-http'),
//         https: require.resolve('https-browserify'),
//         zlib: require.resolve('browserify-zlib'),
//         net: false,
//         tls: false,
//         dgram: false,
//         dns: false,
//         child_process: false,
//         cluster: false,
//         os: false,
//         'tedious': false,
//         'mssql': false,
//         '@prisma/client/runtime': false
//       };

//       // Proporcionar polyfills para process y Buffer
//       config.plugins.push(
//         new webpack.ProvidePlugin({
//           process: 'process/browser',
//           Buffer: ['buffer', 'Buffer'],
//         })
//       );

//       // Ignorar advertencias
//       config.ignoreWarnings = [
//         /Critical dependency/,
//         /The module operates on a resource that should be released/,
//         /Module not found/,
//         /UnhandledSchemeError/,
//         /Can't resolve/
//       ];
//     }
    
//     return config;
//   },
// };

// export default withTM(nextConfig);
