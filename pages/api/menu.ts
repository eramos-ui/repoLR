// pages/api/menu.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Menu } from '@/models/Menu';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();

    const menus = await Menu.find({ isValid: true })
      .sort({ orden: 1 })
      .lean();

    // También puedes ordenar submenus si lo necesitas
    menus.forEach(menu => {
      if (Array.isArray(menu.submenus)) {
        menu.submenus.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
      }
    });

    return res.status(200).json(menus);
  } catch (error) {
    console.error('❌ Error al obtener menús:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
