// /lib/crypto.ts
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex'); // token “bonito” para URL
}

export async function hashToken(token: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}

export async function verifyToken(token: string, tokenHash: string) {
  return bcrypt.compare(token, tokenHash);
}

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}
