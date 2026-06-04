// ─── products.ts ──────────────────────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/products — public
router.get('/', async (req: Request, res: Response) => {
  const { category, page = '1', limit = '12' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    isActive: true,
    ...(category && { category: category as any }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, data: products, total, page: Number(page) });
});

// GET /api/products/:id — public
router.get('/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json({ success: true, data: product });
});

// POST /api/products — admin only
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.create({ data: req.body });
  res.status(201).json({ success: true, data: product });
});

// PATCH /api/products/:id — admin only
router.patch('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id — admin only
router.delete('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { isActive: false }
  });
  res.json({ success: true, message: 'Product archived successfully.' });
});

export default router;
