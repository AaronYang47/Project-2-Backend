import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    avatar: {
        type: String,
        default: 'default-avatar.png' // 默认头像路径
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

export default mongoose.model('User', UserSchema);
