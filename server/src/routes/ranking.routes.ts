import { Router } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { getRanking } from '../services/ranking.service';
import prisma from '../lib/prisma';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { year, section, sort } = req.query;
    const filters = {
      year: year ? parseInt(year as string, 10) : undefined,
      section: section as string | undefined,
      sortOrder: (sort as 'asc' | 'desc') || 'desc',
    };
    const ranking = await getRanking(filters);
    res.json({ success: true, data: ranking });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ranking/:userId/history - Transaction history for ranking display
router.get('/:userId/history', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists and is visible
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Spectators: do not expose their received history
    if (user.preferences?.participationMode === 'SPECTATOR') {
      return res.json({ success: true, data: [] });
    }

    const transactions = await prisma.auraTransaction.findMany({
      where: { toUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: {
          select: { firstName: true, lastName: true, nickname: true },
        },
      },
      take: 100,
    });

    const history = transactions.map((t) => ({
      id: t.id,
      points: t.points * 100, // display as aura units
      type: t.type,
      reason: t.reason,
      createdAt: t.createdAt,
      from: {
        firstName: t.fromUser.firstName,
        lastName: t.fromUser.lastName,
        nickname: t.fromUser.nickname,
      },
    }));

    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
