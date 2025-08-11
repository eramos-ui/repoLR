import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Card } from '@/models/Card';
import { User } from '@/models/User'; // para buscar el rol

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }
    // Buscar el usuario y obtener su rol
    const userDoc = await User.findOne({ email }).lean() as { role?: string } | null;
    if (!userDoc) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const userRole = userDoc.role;

    const cards = await Card.aggregate([
      {
        $lookup: {
          from: 'menu',
          let: { menuId: '$menuId', submenuId: '$submenuId', userRole },
          pipeline: [
            { $unwind: '$submenus' },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$id', '$$menuId'] },
                    { $eq: ['$submenus.id', '$$submenuId'] },
                    { $in: ['$$userRole', '$submenus.perfiles'] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 0,
                path: '$submenus.path',
                formId: '$submenus.formId' // 📌 incluir formId
              }
            }
          ],
          as: 'menuInfo'
        }
      },
      {
        $addFields: {
          path: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$menuInfo.formId" },
                  { $gt: [{ $size: "$menuInfo.formId" }, 0] }
                ]
              },
              then: {
                $concat: [
                  "$pathRelative",
                  "/",
                  { $toString: { $arrayElemAt: ["$menuInfo.formId", 0] } }
                ]
              },
              else: "$pathRelative"
            }
          }
        }
      },
      {
        $project: {
          menuInfo: 0
        }
      },
      { $sort: { orden: 1 } }
    ]);
    res.status(200).json(cards);
  } catch (error) {
    console.error('Error cargando cards:', error);
    res.status(500).json({ error: 'Error al cargar cards' });
  }
}






// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Card } from '@/models/Card';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {

//   try {
//     const menuCards = await Card.find({});
//     res.status(200).json(menuCards);
//   } catch (error) {
//     console.error('❌ Error en API /cards:', error);
//     res.status(500).json({ error: 'Error interno al cargar cards' });
//   }
// }