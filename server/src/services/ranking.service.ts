import prisma from '../lib/prisma';

export const getRanking = async (filters: { year?: number; section?: string; sortOrder?: 'asc' | 'desc' }) => {
  const whereClause: any = {
    role: { not: 'ADMIN' },
    preferences: {
      showInRanking: true,
      participationMode: {
        not: 'SPECTATOR',
      },
    },
    isFrozen: false,
  };

  if (filters.year) {
    whereClause.year = filters.year;
  }
  if (filters.section) {
    whereClause.section = filters.section;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      preferences: true,
      receivedTransactions: {
        select: { points: true },
      },
    },
  });

  const rankedUsers = users.map(user => {
    const totalPoints = user.receivedTransactions.reduce((acc, t) => acc + t.points, 0);
    const aura = totalPoints * 100;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      year: user.year,
      section: user.section,
      aura: user.preferences?.showScore ? aura : null,
      _rawAuraForSort: aura,
    };
  });

  const sortOrder = filters.sortOrder || 'desc';
  rankedUsers.sort((a, b) => sortOrder === 'desc' ? b._rawAuraForSort - a._rawAuraForSort : a._rawAuraForSort - b._rawAuraForSort);

  return rankedUsers.map((user, index) => {
    const { _rawAuraForSort, ...rest } = user;
    return {
      position: index + 1,
      ...rest,
    };
  });
};
