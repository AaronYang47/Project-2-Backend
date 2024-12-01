import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    items: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalPrice: { 
        type: Number, 
        required: true 
    },
    shippingAddress: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

export default mongoose.model('Order', OrderSchema);
