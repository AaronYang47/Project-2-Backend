import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
};

// 错误处理中间件
const handleUploadError = (err, req, res, next) => {
    console.error('Upload error:', err);
    
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({ message: 'File size exceeds 5MB limit!' });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({ message: 'Unexpected file field' });
            default:
                return res.status(400).json({ message: 'File upload error: ' + err.message });
        }
    }
    
    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({ message: err.message });
    }
    
    next(err);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制文件大小为 5MB
    }
});

// 上传头像路由
router.post('/avatar/:userId', auth, (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) {
            return handleUploadError(err, req, res, next);
        }
        
        // 如果没有文件上传
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        next();
    });
}, async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // 严格验证用户权限
        if (!req.user || req.user.id !== userId) {
            // 如果权限验证失败，删除上传的文件
            if (req.file) {
                fs.unlinkSync(path.join(uploadDir, req.file.filename));
            }
            return res.status(403).json({ message: 'Unauthorized to upload avatar' });
        }

        const avatarPath = req.file.filename;

        // 更新用户的头像路径
        const user = await User.findByIdAndUpdate(
            userId,
            { avatar: avatarPath },
            { new: true }
        );

        if (!user) {
            // 如果用户不存在，删除上传的文件
            fs.unlinkSync(path.join(uploadDir, avatarPath));
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Avatar uploaded successfully',
            avatarPath: avatarPath
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        // 如果出错，尝试删除上传的文件
        if (req.file) {
            try {
                fs.unlinkSync(path.join(uploadDir, req.file.filename));
            } catch (unlinkError) {
                console.error('Failed to delete file:', unlinkError);
            }
        }
        res.status(500).json({ 
            message: 'Failed to upload avatar', 
            error: error.message 
        });
    }
});

// 获取头像路由
router.get('/avatar/:userId', auth, async (req, res) => {
    try {
        // 验证用户权限
        if (req.user.id !== req.params.userId) {
            return res.status(403).json({ message: 'Unauthorized to access this avatar' });
        }

        const user = await User.findById(req.params.userId);
        if (!user || !user.avatar) {
            return res.status(404).json({ message: 'Avatar not found' });
        }
        res.json({ avatarPath: user.avatar });
    } catch (error) {
        console.error('Error getting avatar:', error);
        res.status(500).json({ 
            message: 'Failed to get avatar', 
            error: error.message 
        });
    }
});

export default router;
