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

// POST /api/cart/sync — sync cart with frontend state
router.post('/sync', async (req: AuthRequest, res: Response) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Invalid payload: items must be an array.' });
  }

  // Validate items format
  for (const item of items) {
    if (typeof item.id !== 'string' || !item.id.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid item: id is required and must be a string.' });
    }
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: `Invalid item quantity for product ${item.id}: qty must be at least 1.` });
    }
  }

  try {
    // Validate if products exist in database
    const productIds = items.map((item: any) => item.id);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });
    const existingProductIds = new Set(existingProducts.map(p => p.id));

    for (const item of items) {
      if (!existingProductIds.has(item.id)) {
        return res.status(400).json({ success: false, message: `Product not found: Product with ID ${item.id} does not exist.` });
      }
    }

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get or create user cart
      const cart = await tx.cart.upsert({
        where: { userId: req.user!.id },
        create: { userId: req.user!.id },
        update: {},
      });

      // 2. Delete all current items in the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 3. Insert new items
      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((item: any) => ({
            cartId: cart.id,
            productId: item.id,
            quantity: Number(item.qty),
            size: item.variant || 'Standard',
          })),
        });
      }

      // 4. Retrieve updated cart with items and products
      return tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    res.json({ success: true, message: 'Cart synced successfully.', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to sync cart.', error: (error as Error).message });
  }
});

export default router;
