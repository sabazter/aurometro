import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { env } from '../config/env';
import { sendVerificationEmail } from './email.service';

export const register = async (data: any) => {
  const { email, password, firstName, lastName, nickname, year, section, disclaimerAccepted } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('El correo ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomUUID();

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      nickname,
      year: parseInt(year, 10),
      section,
      verificationToken,
      disclaimerAcceptedAt: disclaimerAccepted ? new Date() : null,
      preferences: {
        create: {
          participationMode: 'SPECTATOR',
        },
      },
    },
    include: {
      preferences: true,
    },
  });

  await sendVerificationEmail(email, verificationToken);

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { preferences: true },
  });
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  if (!user.emailVerified) {
    throw new Error('Por favor verifica tu correo electrónico antes de iniciar sesión');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

export const verifyEmail = async (token: string) => {
  const user = await prisma.user.findUnique({ where: { verificationToken: token } });
  if (!user) {
    throw new Error('Token inválido o expirado');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
    },
  });

  return true;
};
