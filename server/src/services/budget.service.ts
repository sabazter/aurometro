import prisma from '../lib/prisma';
import { getWeekStart, getElapsedWeekdays } from '../utils/week';

export const getBudget = async (userId: string) => {
  const weekStart = getWeekStart();
  const elapsedDays = getElapsedWeekdays();

  // Maximum allowed per type based on elapsed weekdays (max 5)
  const maxAccumulated = Math.min(elapsedDays * 1, 5);

  const transactionsThisWeek = await prisma.auraTransaction.findMany({
    where: {
      fromUserId: userId,
      createdAt: {
        gte: weekStart,
      },
    },
  });

  const positiveUsed = transactionsThisWeek.filter(t => t.type === 'POSITIVE').length;
  const negativeUsed = transactionsThisWeek.filter(t => t.type === 'NEGATIVE').length;

  const positiveAvailable = Math.max(0, maxAccumulated - positiveUsed);
  const negativeAvailable = Math.max(0, maxAccumulated - negativeUsed);

  return {
    positiveAvailable: Math.min(positiveAvailable, 5 - positiveUsed),
    negativeAvailable: Math.min(negativeAvailable, 5 - negativeUsed),
    positiveUsed,
    negativeUsed,
    weekStart,
  };
};
