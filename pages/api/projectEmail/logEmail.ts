import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { ProjectEmail } from "@/models/ProjectEmail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    await connectDB();

    const { idProject, idProjectActivity, idActivity, emailProveedor, mensaje, token, anexos } = req.body;

    if (!idProject || !idProjectActivity || !idActivity || !emailProveedor || !mensaje || !token) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const newEmailLog = new ProjectEmail({
      idProject,
      idProjectActivity,
      idActivity,
      emailProveedor,
      mensaje,
      token,
      anexos: anexos || [],
    });

    const savedLog = await newEmailLog.save();

    return res.status(201).json({ message: "Log guardado correctamente.", data: savedLog });

  } catch (error) {
    console.error("Error al guardar el log del email:", error);
    return res.status(500).json({ message: "Error al guardar el log del email.", error });
  }
}
