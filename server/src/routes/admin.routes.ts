import { Router } from 'express';
import { auth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import prisma from '../lib/prisma';

const router = Router();

router.use(auth, adminOnly);

router.get('/transactions', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.query.userId as string | undefined;

    const skip = (page - 1) * limit;

    const whereClause = userId ? {
      OR: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    } : {};

    const [transactions, total] = await Promise.all([
      prisma.auraTransaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          fromUser: { select: { firstName: true, lastName: true } },
          toUser: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.auraTransaction.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/users/:id/freeze', async (req, res) => {
  try {
    const { id } = req.params;
    const { frozen } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { isFrozen: frozen },
      select: { id: true, isFrozen: true },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/users/:id/reset-aura', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.auraTransaction.deleteMany({
      where: { toUserId: id },
    });
    res.json({ success: true, data: { message: 'Aura reseteada con éxito' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });
    res.json({ success: true, data: { message: 'Usuario eliminado (cascada)' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
