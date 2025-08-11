// pages/api/files/getSubidos.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { FileMeta } from "@/models/FileMeta";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    await connectDB();

    const itemsLeidos = await FileMeta.aggregate([
      {
        $addFields: {
          estadoActual: {
            $arrayElemAt: ["$estadoHistory.estado", -1],
          },
          reason:{
            $arrayElemAt: ["$estadoHistory.reason", -1],
          }
        },
      },
      {
        $match: {
          estadoActual: "SUBIDO",
        },
      },
      {
        $project: {
          _id: 1,
          gridFsId: 1,
          filename: 1,
          authorName: 1,
          fuente: 1,
          updatedAt:1,
          estadoActual: 1,
          reason:1,
         },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
    ]);
    // console.log('itemsLeidos',itemsLeidos[0])
  // Mapear SOLO lo que necesito en la grilla
    const items = itemsLeidos.map((it) => {
      // const lastHistory = (it.lastHistory ?? []).slice(-1)[0];
      // console.log('en API getSubidos it',it)
      const lastReason = it.reason ?? null;
      const estadoActual=it.estadoActual ?? null;
      // const gridFsId = String(it.gridFsId);
      const gridFsId = String(it.gridFsId);
      const fechaSubido=(new Date( it.updatedAt)).toISOString().split('T')[0];
      const [year, month, day] = fechaSubido?.split("-") || [];
      const fechaSubidoFormatted = `${day}/${month}/${year}`;
      return {
        fileMetaId: String(it._id),//id de files (FileMeta)
        gridFsId,//id del archivo (uploads.files)
        filename: it.filename,
        updatedAt: fechaSubidoFormatted,     // timestamp del doc (por timestamps:true)
        estadoActual: estadoActual,     // estado actual
        reason: lastReason,          // motivo del último cambio (si existe)
        // URLs útiles por si quieres botones Ver/Descargar:
        // viewUrl: makeAbsUrl(req, `/api/files/${encodeURIComponent(gridFsId)}?disposition=inline`),
        // downloadUrl: makeAbsUrl(req, `/api/files/${encodeURIComponent(gridFsId)}?disposition=attachment`),
      };
    });
    res.status(200).json({ items });
  } catch (error) {
    console.error("Error en getSubidos:", error);
    res.status(500).json({ error: "Error al obtener archivos en estado SUBIDO" });
  }
}
