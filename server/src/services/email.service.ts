import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    console.warn('Email credentials not configured. Mocking email send to:', to);
    console.warn(`Verification link: ${env.FRONTEND_URL}/verify-email/${token}`);
    return;
  }

  const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;
  
  const mailOptions = {
    from: `"Aurómetro" <${env.GMAIL_USER}>`,
    to,
    subject: 'Verifica tu cuenta en Aurómetro',
    html: `
      <h1>¡Bienvenido a Aurómetro!</h1>
      <p>Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
