// import { NextApiRequest, NextApiResponse } from 'next';
// import { connectDB, getDb }from '@/lib/db';
// import { ObjectId } from 'mongodb';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Método no permitido' });
//   }

//   const { id} = req.query;//_id de files (FileMeta)
//   console.log('***id en metadata/[id]',id)
//   if (!id || typeof id !== 'string') {
//     return res.status(400).json({ error: 'gridFsId inválido' });
//   }

//   try {
//     await connectDB();
//     const db = getDb();
//     const fileMeta = await db.collection('files')
//         // .find({ gridFsId: new ObjectId(gridFsId) })// 
//         .find({ _id: new ObjectId(id) }) // para buscar por _id
//         .sort({ createdAt: -1 }) // o .sort({ _id: -1 }) si no usas timestamps
//         .limit(1)
//         .next();
//     if (!fileMeta) {
//         return res.status(404).json({ error: 'Archivo no encontrado.' });
//     }
//     const { fileContent, ...rest } = fileMeta; // por si acaso hay un campo grande
//     //mapeo lo que se necesita para el EditForm
//     const temas=fileMeta.temaIds
//     // console.log('fileMeta',fileMeta)
//     const result={
//       _id: new ObjectId(id) ,
//       documento:fileMeta.filename,
//       temas,
//       authorName:fileMeta.authorName,
//       // authorName:fileMeta.authorName,

//     }
//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Error al buscar por gridFsId:', error);
//     return res.status(500).json({ error: 'Error del servidor' });
//   }
// }
