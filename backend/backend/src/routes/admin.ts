import { Router, Response } from 'express';
import multer from 'multer';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';
import { logger } from '../config/logger';
import { prisma } from '../config/db';
import { OrderStatus } from '@prisma/client';

const router = Router();

// Apply security check middlewares
router.use(protect);
router.use(adminOnly);

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit to 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.') as any, false);
    }
  }
});

// POST /api/admin/upload - Receive file and upload to Cloudinary
router.post('/upload', upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    logger.info(`Admin [${req.user!.email}] uploading product image: ${req.file.originalname}`);
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    res.json({
      success: true,
      message: 'Image uploaded successfully.',
      url: imageUrl
    });
  } catch (error: any) {
    logger.error('Upload route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image.'
    });
  }
});

// GET /api/admin/orders - Retrieve all orders for management
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error: any) {
    logger.error('Fetch admin orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
});

// GET /api/admin/orders/:id - Detailed single order view including status timeline
router.get('/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    logger.error('Fetch order detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
});

// PATCH /api/admin/orders/:id/status - Update order status and log history
router.patch('/orders/:id/status', async (req: AuthRequest, res: Response) => {
  const { status, note } = req.body;

  if (!status || !Object.values(OrderStatus).includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing status.' });
  }

  try {
    // Check if order exists
    const orderExists = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!orderExists) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Run order status update and history log in a database transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: req.params.id },
        data: { status },
        include: { items: true }
      });

      // Create history log entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: req.params.id,
          status,
          note: note || `Status updated to ${status} by admin [${req.user!.email}]`
        }
      });

      return updated;
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: updatedOrder
    });
  } catch (error: any) {
    logger.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// GET /api/admin/analytics - Retrieve dashboard KPIs, recent orders, and stock alerts
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const [totalProducts, totalUsers, totalOrders, revenueAgg, lowStockAlerts, recentOrders] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          NOT: {
            status: 'CANCELLED'
          }
        }
      }),
      prisma.product.findMany({
        where: {
          stock: {
            lt: 10
          },
          isActive: true
        },
        select: {
          id: true,
          name: true,
          stock: true,
          price: true
        },
        orderBy: {
          stock: 'asc'
        }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: revenueAgg._sum.total || 0,
        lowStockAlerts,
        recentOrders
      }
    });
  } catch (error: any) {
    logger.error('Fetch dashboard analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard analytics.' });
  }
});

export default router;
