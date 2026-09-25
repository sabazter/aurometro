import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { auth, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import prisma from '../lib/prisma';

const router = Router();

router.use(auth, adminOnly);

// GET /api/admin/users - List users with search, filters, and aura score
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const search = (req.query.search as string || '').trim();
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
    const section = req.query.section as string | undefined;
    const role = req.query.role as string | undefined;
    const verified = req.query.verified !== undefined ? req.query.verified === 'true' : undefined;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (year) where.year = year;
    if (section && section !== 'all') where.section = section;
    if (role && role !== 'all') where.role = role;
    if (verified !== undefined) where.emailVerified = verified;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: {
          preferences: true,
          receivedTransactions: {
            select: { points: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((user) => {
      const { password, receivedTransactions, ...userWithoutPassword } = user;
      const totalPoints = receivedTransactions.reduce((acc, t) => acc + t.points, 0);
      const aura = totalPoints * 100;
      return {
        ...userWithoutPassword,
        aura,
      };
    });

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/users - Manually create a user
router.post('/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, nickname, year, section, role, emailVerified } = req.body;

    if (!email || !password || !firstName || !lastName || !year || !section) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const isEmailVerified = emailVerified !== undefined ? Boolean(emailVerified) : true;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        nickname: nickname || null,
        year: parseInt(year, 10),
        section,
        role: role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
        emailVerified: isEmailVerified,
        disclaimerAcceptedAt: new Date(),
        onboardingCompleted: true,
        preferences: {
          create: {
            participationMode: role === 'ADMIN' ? 'SPECTATOR' : 'FULL',
            showScore: role !== 'ADMIN',
            showInRanking: role !== 'ADMIN',
            theme: 'DARK',
          },
        },
      },
      include: { preferences: true },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/users/:id - Update user profile, role, or password
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, nickname, year, section, role, emailVerified, isFrozen, password } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (nickname !== undefined) updateData.nickname = nickname || null;
    if (year) updateData.year = parseInt(year, 10);
    if (section) updateData.section = section;
    if (role) updateData.role = role;
    if (emailVerified !== undefined) updateData.emailVerified = Boolean(emailVerified);
    if (isFrozen !== undefined) updateData.isFrozen = Boolean(isFrozen);

    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { preferences: true },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/users/:id/verify-email - Manually verify/unverify email
router.put('/users/:id/verify-email', async (req, res) => {
  try {
    const { id } = req.params;
    const { emailVerified } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        emailVerified: Boolean(emailVerified),
        verificationToken: emailVerified ? null : undefined,
      },
      select: { id: true, emailVerified: true },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/users/:id/freeze - Freeze or unfreeze account
router.put('/users/:id/freeze', async (req, res) => {
  try {
    const { id } = req.params;
    const { frozen } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { isFrozen: Boolean(frozen) },
      select: { id: true, isFrozen: true },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/users/:id/reset-aura - Delete all received points for a user
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

// DELETE /api/admin/users/:id - Delete user permanently
router.delete('/users/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user!.userId) {
      return res.status(400).json({ success: false, error: 'No puedes eliminar tu propia cuenta desde el panel' });
    }

    await prisma.user.delete({
      where: { id },
    });
    res.json({ success: true, data: { message: 'Usuario eliminado con éxito' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/transactions - Transaction logs
router.get('/transactions', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
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
          fromUser: { select: { firstName: true, lastName: true, email: true } },
          toUser: { select: { firstName: true, lastName: true, email: true } },
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

// DELETE /api/admin/reset-all - Mass reset: delete ALL aura transactions
router.delete('/reset-all', async (req: AuthRequest, res) => {
  try {
    const deleted = await prisma.auraTransaction.deleteMany({});
    res.json({
      success: true,
      data: { message: `Reseteo masivo completado. ${deleted.count} transacciones eliminadas.`, count: deleted.count },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
