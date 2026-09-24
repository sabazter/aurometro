import { Router } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.use(auth);

router.get('/me', async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { preferences: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/me/preferences', async (req: AuthRequest, res) => {
  try {
    const { participationMode, showScore, showInRanking, theme } = req.body;
    const prefs = await prisma.userPreferences.update({
      where: { userId: req.user!.userId },
      data: {
        ...(participationMode && { participationMode }),
        ...(showScore !== undefined && { showScore }),
        ...(showInRanking !== undefined && { showInRanking }),
        ...(theme && { theme }),
      },
    });
    res.json({ success: true, data: prefs });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/me/profile', async (req: AuthRequest, res) => {
  try {
    const { nickname, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { nickname, avatarUrl },
      select: { id: true, nickname: true, avatarUrl: true },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/me/onboarding', async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { onboardingCompleted: true },
      select: { id: true, onboardingCompleted: true },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/me', async (req: AuthRequest, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user!.userId },
    });
    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/year/:year/section/:section', async (req: AuthRequest, res) => {
  try {
    const { year, section } = req.params;
    const users = await prisma.user.findMany({
      where: {
        year: parseInt(year, 10),
        section,
        isFrozen: false,
        role: { not: 'ADMIN' },
        preferences: {
          participationMode: {
            not: 'SPECTATOR',
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nickname: true,
        avatarUrl: true,
        preferences: {
          select: { participationMode: true },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      nickname: u.nickname,
      avatarUrl: u.avatarUrl,
      participationMode: u.preferences?.participationMode,
    }));

    res.json({ success: true, data: formattedUsers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
