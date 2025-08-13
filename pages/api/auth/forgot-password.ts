// /pages/api/auth/forgot-password.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectDB();
    const { email } = req.body as { email?: string };
    // Respuesta genérica SIEMPRE (anti-enumeración)
    const genericOK = () => res.status(200).json({ message: "Si el email existe, enviaremos un enlace." });

    if (!email) return genericOK();

    // const user = await User.findOne({ email }).select("_id email");
    const user = await User.findOne({ email, valid: "vigente" }).select("_id email");
    if (!user) return genericOK();

    // Invalida tokens previos
    await PasswordResetToken.updateMany({ userId: user._id, used: false }, { $set: { used: true } });

    // Genera token + referencia para lookup
    const token = crypto.randomBytes(32).toString("hex");
    const ref = crypto.createHash("sha256").update(token + Date.now().toString()).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await PasswordResetToken.create({ userId: user._id, tokenHash: ref, expiresAt, used: false });

    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&ref=${encodeURIComponent(ref)}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@tu-dominio.com",
      to: user.email,
      subject: "Restablecer contraseña",
      html: `<p>Recibimos un pedido para restablecer tu contraseña.</p>
             <p>Enlace válido por 1 hora:</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>Si no solicitaste este cambio, ignora este correo.</p>`,
    });

    return genericOK();
  } catch (e) {
    // Aun con error interno, respondemos igual por seguridad
    return res.status(200).json({ message: "Si el email existe, enviaremos un enlace." });
  }
}
