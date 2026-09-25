import prisma from '../lib/prisma';

const DAILY_LIMIT = 3;

const getStartOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
};

export const getBudget = async (userId: string) => {
  const todayStart = getStartOfToday();

  const transactionsToday = await prisma.auraTransaction.findMany({
    where: {
      fromUserId: userId,
      createdAt: {
        gte: todayStart,
      },
    },
  });

  const usedToday = transactionsToday.length;
  const dailyRemaining = Math.max(0, DAILY_LIMIT - usedToday);

  // Keep positiveAvailable/negativeAvailable for backwards compat with frontend
  // Both now share the same combined daily pool
  return {
    positiveAvailable: dailyRemaining,
    negativeAvailable: dailyRemaining,
    dailyRemaining,
    usedToday,
    dailyLimit: DAILY_LIMIT,
  };
};
