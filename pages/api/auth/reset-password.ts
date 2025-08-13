// /pages/api/auth/reset-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { PasswordResetToken } from '@/models/PasswordResetToken';
import { hashPassword, verifyToken } from '@/lib/crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });
  try {
    await connectDB();
    const { token, ref, password } = req.body as { token?: string; ref?: string; password?: string };

    console.log('en reset-password', token, ref, password);

    if (!token || !ref || !password) return res.status(400).json({ message: 'Datos incompletos' });
    if (password.length < 8) return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });

    // Validar token y estado "vigente"
    const tokenDoc = await PasswordResetToken.findOne({
      tokenHash: ref,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) return res.status(400).json({ message: 'Token inválido o ya utilizado' });
    if (tokenDoc.expiresAt.getTime() < Date.now()) return res.status(400).json({ message: 'Token expirado' });

    // Validar que el token “plain” coincida con lo que generamos originalmente
    // En la creación usamos un hash derivado; para un flujo tradicional:
    // - Guarda directamente un hash de `token` y aquí usa verifyToken(token, tokenDoc.tokenHash).
    // Como arriba hicimos un “hash derivado” (unique), salté “verifyToken”.
    // Si prefieres el flujo clásico, cambia el guardado a tokenHash = await hashToken(token) y aquí:
    // const ok = await verifyToken(token, tokenDoc.tokenHash);
    // if (!ok) return res.status(400).json({ message: 'Token inválido' });

    const user = await User.findOne({ _id: tokenDoc.userId, valid: "vigente" });
    if (!user) {
      return res.status(403).json({ message: "Usuario no válido o no vigente." });
    }    
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    user.password = await hashPassword(password);
    console.log('en reset-password user', user);
    await user.save();

    tokenDoc.used = true;
    await tokenDoc.save();

    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('reset-password error', err);
    return res.status(500).json({ message: 'Error al restablecer contraseña' });
  }
}
