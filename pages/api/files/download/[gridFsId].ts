// pages/api/files/download/[gridFsId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBucket } from "@/lib/db";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { gridFsId } = req.query;

  if (!gridFsId || typeof gridFsId !== "string") {
    return res.status(400).json({ error: "gridFsId no válido" });
  }

  const bucket = await getBucket();

  try {
    const _id = new ObjectId(gridFsId);
    const file = await bucket.find({ _id }).next();

    if (!file) return res.status(404).json({ error: "Archivo no encontrado" });

    res.setHeader("Content-Type", file.contentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error al descargar archivo:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
