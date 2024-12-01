import express from 'express';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get products by IDs
router.get('/byIds', async (req, res) => {
    try {
        const ids = req.query.ids.split(',');
        const products = await Product.find({ _id: { $in: ids } });
        res.json(products);
    } catch (error) {
        console.error('Get products by IDs error:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// Add initial products (for development)
router.post('/init', async (req, res) => {
    try {
        // Delete existing products
        await Product.deleteMany({});

        // Initial products data
        const initialProducts = [
            {
                name: 'Diamond Ring',
                description: 'Beautiful diamond ring with 18K gold band',
                price: 2999.99,
                imageUrl: '/images/products/ring.jpg',
                category: 'Rings'
            },
            {
                name: 'Golden Necklace',
                description: 'Elegant golden necklace with pendant',
                price: 1599.99,
                imageUrl: '/images/products/necklace.jpg',
                category: 'Necklaces'
            },
            {
                name: 'Pearl Earrings',
                description: 'Classic pearl earrings with silver details',
                price: 899.99,
                imageUrl: '/images/products/earrings.jpg',
                category: 'Earrings'
            },
            {
                name: 'Silver Bracelet',
                description: 'Delicate silver bracelet with charm',
                price: 499.99,
                imageUrl: '/images/products/bracelet.jpg',
                category: 'Bracelets'
            },
            {
                name: 'Luxury Watch',
                description: 'Premium luxury watch with leather strap',
                price: 3999.99,
                imageUrl: '/images/products/watch.jpg',
                category: 'Watches'
            }
        ];

        // Insert products
        const products = await Product.insertMany(initialProducts);
        res.status(201).json(products);
    } catch (error) {
        console.error('Init products error:', error);
        res.status(500).json({ message: 'Error initializing products' });
    }
});

// Add new product (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
});

export default router;
