import mongoose from 'mongoose';
import validator from 'validator';

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username must be less than 20 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address'
        }
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 添加索引以提高查询性能
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

// 添加一个虚拟属性
UserSchema.virtual('displayName').get(function() {
    return this.username || this.email.split('@')[0];
});

// 在保存之前的钩子
UserSchema.pre('save', function(next) {
    // 可以在这里添加额外的验证或处理逻辑
    if (this.username) {
        this.username = this.username.trim();
    }
    next();
});

// 错误处理中间件
UserSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('Username or email already exists'));
    } else {
        next(error);
    }
});

export default mongoose.model('User', UserSchema);
