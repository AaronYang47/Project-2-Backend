import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = (req, res, next) => {
    console.log('Checking authentication...');
    console.log('Headers:', req.headers);
    
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'No authentication token provided' });
    }

    try {
        console.log('Verifying token...');
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token verified successfully:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({ message: 'Invalid authentication token' });
    }
};

export default auth;
