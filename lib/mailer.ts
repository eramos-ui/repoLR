// /lib/mailer.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true si usas 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetEmail(to: string, resetUrl: string) {
  const from = process.env.MAIL_FROM || 'no-reply@tu-dominio.com';
  const html = `
    <p>Recibimos un pedido para restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente enlace (válido por 1 hora):</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Si no solicitaste este cambio, ignora este correo.</p>
  `;
  await transporter.sendMail({
    from,
    to,
    subject: 'Restablecer contraseña',
    html,
  });
}
