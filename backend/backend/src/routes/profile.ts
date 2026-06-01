import { Router, Response } from 'express';
import { prisma } from '../config/db';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

// GET /api/profile
router.get('/', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, phone: true, profile: true, createdAt: true },
  });
  res.json({ success: true, data: user });
});

// PATCH /api/profile
router.patch('/', async (req: AuthRequest, res: Response) => {
  const { name, phone, address, city, country, zipCode } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name, phone },
  });

  const profile = await prisma.profile.upsert({
    where: { userId: req.user!.id },
    create: { userId: req.user!.id, address, city, country, zipCode },
    update: { address, city, country, zipCode },
  });

  res.json({ success: true, data: { ...user, profile } });
});

export default router;
