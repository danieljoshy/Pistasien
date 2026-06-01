import { Router, Response } from 'express';
import { prisma } from '../config/db';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

// GET /api/orders — user's orders
router.get('/', async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: orders });
});

// GET /api/orders/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  res.json({ success: true, data: order });
});

// POST /api/orders — place order from cart
router.post('/', async (req: AuthRequest, res: Response) => {
  const { address } = req.body;

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty.' });
  }

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      total,
      address,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
        })),
      },
    },
    include: { items: true },
  });

  // Clear cart after order
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  res.status(201).json({ success: true, data: order });
});

export default router;
