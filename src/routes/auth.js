import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// 注册路由
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        console.log('Registration attempt:', { username, email });

        // 输入验证
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Please provide all required fields',
                missing: {
                    username: !username,
                    email: !email,
                    password: !password
                }
            });
        }

        // 检查用户是否已存在
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or email already exists',
                field: existingUser.email === email ? 'email' : 'username'
            });
        }

        // 加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 创建新用户
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        try {
            await user.save();
        } catch (saveError) {
            console.error('User save error:', saveError);
            return res.status(500).json({ 
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? saveError.message : 'Internal server error'
            });
        }

        // 生成 JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '24h' }
        );

        // 返回用户信息和token
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// 登录路由
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 查找用户
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // 生成 JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '24h' }
        );

        // 返回用户信息和token
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

export default router;
