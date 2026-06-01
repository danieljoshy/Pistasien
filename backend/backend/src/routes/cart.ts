import { Router, Response } from 'express';
import { prisma } from '../config/db';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// All cart routes require auth
router.use(protect);

// GET /api/cart
router.get('/', async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.id },
    include: { items: { include: { product: true } } },
  });
  res.json({ success: true, data: cart || { items: [] } });
});

// POST /api/cart — add item
router.post('/', async (req: AuthRequest, res: Response) => {
  const { productId, quantity = 1, size } = req.body;

  // Upsert cart
  const cart = await prisma.cart.upsert({
    where: { userId: req.user!.id },
    create: { userId: req.user!.id },
    update: {},
  });

  // Upsert cart item
  const item = await prisma.cartItem.upsert({
    where: { cartId_productId_size: { cartId: cart.id, productId, size: size || '' } },
    create: { cartId: cart.id, productId, quantity, size },
    update: { quantity: { increment: quantity } },
  });

  res.json({ success: true, data: item });
});

// PATCH /api/cart/:itemId — update quantity
router.patch('/:itemId', async (req: AuthRequest, res: Response) => {
  const { quantity } = req.body;
  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    return res.json({ success: true, message: 'Item removed.' });
  }
  const item = await prisma.cartItem.update({
    where: { id: req.params.itemId },
    data: { quantity },
  });
  res.json({ success: true, data: item });
});

// DELETE /api/cart/:itemId
router.delete('/:itemId', async (_req, res: Response) => {
  await prisma.cartItem.delete({ where: { id: _req.params.itemId } });
  res.json({ success: true, message: 'Item removed from cart.' });
});

// DELETE /api/cart — clear cart
router.delete('/', async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ success: true, message: 'Cart cleared.' });
});

export default router;
