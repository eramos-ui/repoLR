import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET || "clave-super-secreta";
console.log('SECRET_KEY',SECRET_KEY);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const { proveedorId } = req.body;

    if (!proveedorId) {
      return res.status(400).json({ message: "Falta el ID del proveedor" });
    }

    // 📌 Generar el token con 48h de expiración
    const token = jwt.sign({ proveedorId }, SECRET_KEY, { expiresIn: "48h" });

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error generando token:", error);
    return res.status(500).json({ message: "Error generando token" });
  }
}
