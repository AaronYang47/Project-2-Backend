import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js'; // Add Product model import
import auth from '../middleware/auth.js';

const router = express.Router();

// 创建订单
router.post('/', auth, async (req, res) => {
    try {
        const { products, shippingAddress } = req.body;
        const userId = req.user.id;

        // 验证产品存在
        const orderItems = [];
        let totalPrice = 0;

        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }
            orderItems.push({
                product: item.productId,
                quantity: item.quantity,
                price: product.price
            });
            totalPrice += product.price * item.quantity;
        }
        
        const order = new Order({
            userId,
            items: orderItems,
            totalPrice,
            shippingAddress,
            status: 'pending'
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: '创建订单失败', error: error.message });
    }
});

// 获取用户的所有订单
router.get('/user', auth, async (req, res) => {
    try {
        const userId = req.user.id;  // 从认证的用户获取ID
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: '获取订单失败' });
    }
});

// 获取特定订单
router.get('/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            userId: req.user.id  // 确保只能访问自己的订单
        });

        if (!order) {
            return res.status(404).json({ message: '订单未找到' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: '获取订单失败' });
    }
});

// 更新订单状态
router.patch('/:orderId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status },
            { new: true }
        );
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update order status' });
    }
});

export default router;
