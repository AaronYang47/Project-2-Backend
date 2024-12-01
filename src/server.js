import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';
import shippingRoutes from './routes/shipping.js';
import productRoutes from './routes/products.js';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// 连接数据库
connectDB().then(() => {
    console.log('Database connection successful');
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    // 在生产环境中返回一个友好的错误消息
    app.use((req, res) => {
        res.status(500).json({ 
            message: 'Database connection error, please try again later',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });
});

// CORS 配置
const corsOptions = {
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:5174',
            'http://localhost:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5173'
        ];
        // 允许没有 origin 的请求（比如来自 Postman 或移动应用）
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
};

// 中间件配置
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// 预检请求处理
app.options('*', cors(corsOptions));

// 静态文件服务
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/products', productRoutes);

// 基础路由
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 服务器配置
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
