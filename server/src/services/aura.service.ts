import prisma from '../lib/prisma';
import { getBudget } from './budget.service';

export const givePoint = async (fromUserId: string, toUserId: string, type: 'POSITIVE' | 'NEGATIVE', reason?: string) => {
  if (fromUserId === toUserId) {
    throw new Error('No puedes darte puntos a ti mismo');
  }

  // Reason is mandatory
  if (!reason || reason.trim().length === 0) {
    throw new Error('La razón es obligatoria para dar o quitar aura');
  }

  const [fromUser, toUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: fromUserId }, include: { preferences: true } }),
    prisma.user.findUnique({ where: { id: toUserId }, include: { preferences: true } }),
  ]);

  if (!fromUser || !toUser) {
    throw new Error('Usuario no encontrado');
  }

  if (toUser.role === 'ADMIN') {
    throw new Error('Los administradores no participan en el sistema de puntos');
  }

  if (fromUser.isFrozen) {
    throw new Error('Tu cuenta está congelada, no puedes dar puntos');
  }

  if (toUser.isFrozen) {
    throw new Error('El usuario destino está congelado');
  }

  if (fromUser.preferences?.participationMode === 'SPECTATOR') {
    throw new Error('Como espectador no puedes dar puntos');
  }

  if (toUser.preferences?.participationMode === 'SPECTATOR') {
    throw new Error('El usuario destino es espectador y no puede recibir puntos');
  }

  // Cooldown check: same user pair in last 24 hours for same type
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentTransaction = await prisma.auraTransaction.findFirst({
    where: {
      fromUserId,
      toUserId,
      type,
      createdAt: {
        gte: twentyFourHoursAgo,
      },
    },
  });

  if (recentTransaction) {
    throw new Error(`Ya diste un punto ${type === 'POSITIVE' ? 'positivo' : 'negativo'} a este usuario en las últimas 24 horas`);
  }

  // Daily budget check (combined pool)
  const budget = await getBudget(fromUserId);
  if (budget.dailyRemaining <= 0) {
    throw new Error(`Has alcanzado el límite de ${budget.dailyLimit} puntos por día. Vuelve mañana.`);
  }

  const points = type === 'POSITIVE' ? 1 : -1;

  const transaction = await prisma.auraTransaction.create({
    data: {
      fromUserId,
      toUserId,
      type,
      points,
      reason: reason.trim().slice(0, 140),
    },
  });

  return transaction;
};
