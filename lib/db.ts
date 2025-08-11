
// /lib/db.ts
import mongoose from 'mongoose';
import type { Db } from 'mongodb';
import { GridFSBucket } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error('❌ MONGODB_URI no está definido');

type GlobalCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  bucket: GridFSBucket | null;
};
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: GlobalCache | undefined;
}
const globalCache: GlobalCache = global._mongooseCache ?? { conn: null, promise: null, bucket: null };

export async function connectDB() {
  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    // Notas:
    // - Si estás en Atlas, no necesitas pasar retryWrites/w aquí. Ya van en el URI.
    // - En local sin réplica, evita retryWrites/w=majority.
    globalCache.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  globalCache.conn = await globalCache.promise;
  global._mongooseCache = globalCache;
  return globalCache.conn;
} 

export function getDb(): Db {
  if (!mongoose.connection?.db) throw new Error('DB no inicializada; llama primero a connectDB()');
  return mongoose.connection.db;
}

export function getBucket(): GridFSBucket {
  if (globalCache.bucket) return globalCache.bucket;
  if (!mongoose.connection?.db) throw new Error('DB no inicializada; llama primero a connectDB()');

  globalCache.bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads', // crea uploads.files y uploads.chunks al primer write
  });
  global._mongooseCache = globalCache;
  return globalCache.bucket!;
}



// import mongoose from 'mongoose';
// import { MongoClient } from 'mongodb';


// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/respositorop?replicaSet=rs0';

// console.log("En db MONGODB_URI:", MONGODB_URI);
// if (!MONGODB_URI) {
//   throw new Error('❌ MONGODB_URI no está definido en las variables de entorno.');
// }
// let cachedClient: MongoClient | null = null;

// export const connectDB = async () => {
//   console.log("Intentando conectar a Mongo...", MONGODB_URI);
//   try {
//     if (mongoose.connection.readyState >= 1) {
//       console.log('✅ Ya conectado a MongoDB');
//       return;
//     }

//     await mongoose.connect(MONGODB_URI, {
//       retryWrites: true, // importante para transacciones
//       w: 'majority',     // asegura confirmación de escritura
//     });
//     console.log('✅ Conexión a MongoDB exitosa ',MONGODB_URI);
//   } catch (error: any) {
//     console.error('🔴 Error al conectar a MongoDB:', error);
//     throw error;
//   }
// };

/**
 * Obtiene la instancia de la base de datos para GridFS
 */
// export const getDatabase = async () => {
//   if (!cachedClient) {
//     try {
//       cachedClient = new MongoClient(MONGODB_URI);
//       await cachedClient.connect();
//       console.log('✅ Cliente de MongoDB conectado para GridFS');
//     } catch (error) {
//       console.error('🔴 Error al conectar a MongoDB para GridFS:', error);
//       throw error;
//     }
//   }

//   return cachedClient.db();
// };



// import mongoose from 'mongoose';

// const MONGODB_URI= process.env.MONGODB_URI || 'mongodb://localhost:27017/fotvadmin';

// export const connectDB = async () => {
//     try {
//       if (mongoose.connection.readyState >= 1) {
//         console.log('✅ Ya conectado a MongoDB');
//         return;
//       }
//         await mongoose.connect(MONGODB_URI);
//         console.log('✅ Conexión a MongoDB exitosa');
//       } catch (error: any) {
//         console.error('🔴 Error al conectar a MongoDB:', error);
//         throw error;
//       }
// };