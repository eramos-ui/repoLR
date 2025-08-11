// api/users/byPerfil.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { role } = req.query;

  if (!role || typeof role !== 'string') {
    return res.status(400).json({ error: 'Parámetro `role` requerido' });
  }

  try {
    await connectDB();

    // Obtener el último documento por usuario con ese perfil
    const usuarios = await User.aggregate([
      { $match: { role, valid: 'vigente' } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: '$user', // agrupar por nombre de usuario
          doc: { $first: '$$ROOT' } // quedarnos con el más reciente
        }
      },
      { $replaceRoot: { newRoot: '$doc' } }
    ]);
    // Transformar a OptionsSelect
    // const options = usuarios.map((u) => ({
    //   value: u.user,
    //   label: `${u.name} (${u.user})`
    // }));
    // console.log('en api users/byPerfil usuarios',usuarios);
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error('❌ Error en la consulta de usuarios por perfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
