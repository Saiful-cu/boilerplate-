import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, param } from 'express-validator';
import Order from '@/modules/orders/model';
import Product from '@/modules/products/model';
import User from '@/modules/users/model';
import WhatsAppLog from '@/modules/whatsappLogs/model';
import { adminAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validators';

const router = Router();
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;
const USER_ROLES = ['admin', 'customer'] as const;

const orderIdValidation = [
    param('id').isMongoId().withMessage('Invalid order id'),
    validate,
];

const updateOrderValidation = [
    param('id').isMongoId().withMessage('Invalid order id'),
    body('orderStatus').optional().isIn(ORDER_STATUSES as any).withMessage('Invalid order status'),
    body('status').optional().isIn(ORDER_STATUSES as any).withMessage('Invalid order status'),
    body('paymentStatus').optional().isIn(PAYMENT_STATUSES as any).withMessage('Invalid payment status'),
    body('shippingCost').optional().isFloat({ min: 0 }).withMessage('Shipping cost must be a non-negative number'),
    body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a non-negative number'),
    validate,
];

const userIdValidation = [
    param('id').isMongoId().withMessage('Invalid user id'),
    validate,
];

const createUserValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(USER_ROLES as any)
        .withMessage('Role must be admin or customer'),
    body('phone')
        .optional({ values: 'falsy' })
        .isString()
        .isLength({ max: 30 })
        .withMessage('Phone must be at most 30 characters'),
    body('isVerified')
        .optional()
        .isBoolean()
        .withMessage('isVerified must be true or false'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be true or false'),
    validate,
];

const updateUserValidation = [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(USER_ROLES as any)
        .withMessage('Role must be admin or customer'),
    body('phone')
        .optional()
        .isString()
        .isLength({ max: 30 })
        .withMessage('Phone must be at most 30 characters'),
    body('isVerified')
        .optional()
        .isBoolean()
        .withMessage('isVerified must be true or false'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be true or false'),
    validate,
];

// Get dashboard statistics
router.get('/stats', adminAuth, async (req: Request, res: Response) => {
    try {
        const { timeRange = 'all' } = req.query;

        let dateFilter: any = {};
        const now = new Date();

        switch (timeRange) {
            case 'week': {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateFilter = { createdAt: { $gte: weekAgo } };
                break;
            }
            case 'month': {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                dateFilter = { createdAt: { $gte: monthAgo } };
                break;
            }
            case 'year': {
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                dateFilter = { createdAt: { $gte: yearAgo } };
                break;
            }
            default:
                dateFilter = {};
        }

        const totalOrders = await Order.countDocuments(dateFilter);
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'customer' });

        const orders = await Order.find(dateFilter).populate('items.product');
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        let totalCost = 0;
        const profitByProductMap: Record<string, any> = {};

        orders.forEach(order => {
            order.items.forEach((item: any) => {
                if (item.product) {
                    const productCost = (item.product.cost || 0) + (item.product.externalCost || 0);
                    const itemRevenue = item.price * item.quantity;
                    const itemCost = productCost * item.quantity;
                    const itemProfit = itemRevenue - itemCost;

                    totalCost += itemCost;

                    const productId = item.product._id.toString();
                    if (!profitByProductMap[productId]) {
                        profitByProductMap[productId] = {
                            name: item.product.name,
                            profit: 0,
                            revenue: 0,
                            cost: 0,
                            unitsSold: 0
                        };
                    }
                    profitByProductMap[productId].profit += itemProfit;
                    profitByProductMap[productId].revenue += itemRevenue;
                    profitByProductMap[productId].cost += itemCost;
                    profitByProductMap[productId].unitsSold += item.quantity;
                }
            });
        });

        const totalProfit = totalRevenue - totalCost;

        const profitByProduct = Object.values(profitByProductMap).map((item: any) => ({
            name: item.name,
            profit: item.profit,
            profitPerUnit: item.unitsSold > 0 ? item.profit / item.unitsSold : 0,
            margin: item.cost > 0 ? ((item.profit / item.cost) * 100).toFixed(2) : 0,
            unitsSold: item.unitsSold,
            revenue: item.revenue,
            cost: item.cost
        }));

        const topProfitProducts = profitByProduct
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 10);

        let trendStartDate: Date;
        switch (timeRange) {
            case 'week':
                trendStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                trendStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                trendStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                trendStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const recentOrders = await Order.find({ createdAt: { $gte: trendStartDate } })
            .populate('items.product')
            .sort({ createdAt: 1 });

        const dailyData: Record<string, any> = {};
        recentOrders.forEach(order => {
            const date = (order.createdAt || new Date()).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { date, revenue: 0, profit: 0, cost: 0 };
            }

            dailyData[date].revenue += order.totalAmount;

            order.items.forEach((item: any) => {
                if (item.product) {
                    const productCost = (item.product.cost || 0) + (item.product.externalCost || 0);
                    const orderProfit = (item.price - productCost) * item.quantity;
                    dailyData[date].profit += orderProfit;
                    dailyData[date].cost += productCost * item.quantity;
                }
            });
        });

        const profitTrend = Object.values(dailyData).map((day: any) => ({
            date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: parseFloat(day.revenue.toFixed(2)),
            profit: parseFloat(day.profit.toFixed(2)),
            cost: parseFloat(day.cost.toFixed(2))
        }));

        const recentOrdersList = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            totalOrders,
            totalProducts,
            totalUsers,
            totalRevenue,
            totalProfit,
            totalCost,
            profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0,
            topProfitProducts,
            profitTrend,
            recentOrders: recentOrdersList
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all orders
router.get('/orders', adminAuth, async (req: Request, res: Response) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json({ data: orders });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single order details
router.get('/orders/:id', adminAuth, orderIdValidation, async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new order (Admin)
router.post('/orders', adminAuth, async (req: Request, res: Response) => {
    try {
        const {
            user,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
            paymentStatus,
            orderStatus,
            shippingMethod,
            shippingCost,
            createNewCustomer
        } = req.body;

        if (!items || items.length === 0 || !totalAmount || !shippingAddress) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let customerId = user;

        if (!customerId || createNewCustomer) {
            const { firstName, lastName, email, phone } = shippingAddress;

            if (!email || !phone) {
                return res.status(400).json({ message: 'Email and phone are required for new customers' });
            }

            let existingUser = await User.findOne({
                $or: [
                    { email: email.toLowerCase() },
                    { phone: phone }
                ]
            });

            if (existingUser) {
                customerId = existingUser._id;
            } else {
                const randomPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                const newUser = new User({
                    name: `${firstName} ${lastName}`.trim(),
                    email: email.toLowerCase(),
                    phone: phone,
                    password: hashedPassword,
                    role: 'customer',
                    address: {
                        street: shippingAddress.street,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        zipCode: shippingAddress.zipCode,
                        country: shippingAddress.country || 'Bangladesh'
                    }
                });

                await newUser.save();
                customerId = newUser._id;
            }
        }

        const order = new Order({
            user: customerId,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod: paymentMethod || 'cash_on_delivery',
            paymentStatus: paymentStatus || 'pending',
            orderStatus: orderStatus || 'pending',
            shippingMethod: shippingMethod || 'inside_dhaka',
            shippingCost: shippingCost || 70,
            statusHistory: [
                {
                    status: orderStatus || 'pending',
                    timestamp: new Date(),
                    note: 'Order created by admin'
                }
            ]
        });

        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('items.product');

        res.status(201).json(populatedOrder);
    } catch (error: any) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update order
router.put('/orders/:id', adminAuth, updateOrderValidation, async (req: Request, res: Response) => {
    try {
        const {
            orderStatus,
            status,
            paymentStatus,
            trackingNumber,
            shippingAddress,
            shippingMethod,
            shippingCost,
            items,
            totalAmount
        } = req.body;

        const updateData: any = {};
        const nextOrderStatus = orderStatus || status;

        if (nextOrderStatus) updateData.orderStatus = nextOrderStatus;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (shippingAddress) updateData.shippingAddress = shippingAddress;
        if (shippingMethod) updateData.shippingMethod = shippingMethod;
        if (shippingCost !== undefined) updateData.shippingCost = shippingCost;
        if (items) updateData.items = items;
        if (totalAmount !== undefined) updateData.totalAmount = totalAmount;

        const currentOrder = await Order.findById(req.params.id);
        if (currentOrder && nextOrderStatus && nextOrderStatus !== currentOrder.orderStatus) {
            updateData.$push = {
                statusHistory: {
                    status: nextOrderStatus,
                    timestamp: new Date(),
                    note: 'Status updated by admin'
                }
            };
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('user', 'name email').populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete order
router.delete('/orders/:id', adminAuth, orderIdValidation, async (req: Request, res: Response) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all users
router.get('/users', adminAuth, async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ data: users });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single user
router.get('/users/:id', adminAuth, userIdValidation, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new user
router.post('/users', adminAuth, createUserValidation, async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, phone, address, isVerified, isActive } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || 'customer',
            phone: phone || '',
            isVerified: typeof isVerified === 'boolean' ? isVerified : false,
            isActive: typeof isActive === 'boolean' ? isActive : true,
            address: address || {},
        });

        await user.save();
        const userResponse = user.toObject();
        delete (userResponse as any).password;

        res.status(201).json(userResponse);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user
router.put('/users/:id', adminAuth, updateUserValidation, async (req: Request, res: Response) => {
    try {
        const { name, email, role, phone, password, address, isVerified, isActive } = req.body;
        const updateData: any = {};

        if (name) updateData.name = name;
        if (email) {
            const existingUser = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: req.params.id }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            updateData.email = email.toLowerCase();
        }
        if (role) updateData.role = role;
        if (phone !== undefined) updateData.phone = phone;
        if (address) updateData.address = address;
        if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user
router.delete('/users/:id', adminAuth, userIdValidation, async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Log WhatsApp message
router.post('/whatsapp-logs', adminAuth, async (req: Request, res: Response) => {
    try {
        const { customerName, customerPhone, customerId, message, templateId } = req.body;

        if (!customerName || !customerPhone || !message) {
            return res.status(400).json({
                message: 'Missing required fields: customerName, customerPhone, and message are required'
            });
        }

        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!phoneRegex.test(customerPhone)) {
            return res.status(400).json({
                message: 'Invalid Bangladesh phone number format. Must be 01XXXXXXXXX (11 digits)'
            });
        }

        if (message.length < 10 || message.length > 4096) {
            return res.status(400).json({
                message: 'Message must be between 10 and 4096 characters'
            });
        }

        const whatsappLog = new WhatsAppLog({
            customerName,
            customerPhone,
            customerId: customerId || null,
            message,
            templateId: templateId || 'custom',
            adminId: req.user!._id,
            adminName: req.user!.name,
            status: 'logged'
        });

        await whatsappLog.save();

        res.status(201).json({
            success: true,
            message: 'WhatsApp message logged successfully',
            data: whatsappLog
        });
    } catch (error: any) {
        console.error('Error logging WhatsApp message:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while logging WhatsApp message',
            error: error.message
        });
    }
});

// Get WhatsApp logs
router.get('/whatsapp-logs', adminAuth, async (req: Request, res: Response) => {
    try {
        const { customerId, customerPhone, limit = '50', page = '1' } = req.query;

        const query: any = {};
        if (customerId) query.customerId = customerId;
        if (customerPhone) query.customerPhone = customerPhone;

        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);
        const skip = (pageNum - 1) * limitNum;

        const logs = await WhatsAppLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip)
            .populate('adminId', 'name email')
            .populate('customerId', 'name email');

        const total = await WhatsAppLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        console.error('Error fetching WhatsApp logs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching WhatsApp logs',
            error: error.message
        });
    }
});

export default router;
