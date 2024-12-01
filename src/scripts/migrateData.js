import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const LOCAL_DB = 'mongodb://localhost:27017/glassstore';
const ATLAS_DB = process.env.MONGODB_URI;

async function migrateData() {
    let localConnection;
    let atlasConnection;
    
    try {
        // 连接本地数据库
        localConnection = await mongoose.createConnection(LOCAL_DB);
        console.log('Connected to local database');
        
        // 连接 Atlas 数据库
        atlasConnection = await mongoose.createConnection(ATLAS_DB);
        console.log('Connected to Atlas database');

        // 在本地连接上定义模型
        const LocalProduct = localConnection.model('Product', Product.schema);
        
        // 在 Atlas 连接上定义模型
        const AtlasProduct = atlasConnection.model('Product', Product.schema);

        // 获取本地数据
        const products = await LocalProduct.find({});
        console.log(`Found ${products.length} products in local database`);

        if (products.length === 0) {
            console.log('No products found in local database');
            process.exit(0);
        }

        // 清除 Atlas 中的现有数据
        await AtlasProduct.deleteMany({});
        console.log('Cleared existing products in Atlas database');

        // 将数据插入到 Atlas
        const result = await AtlasProduct.insertMany(products);
        console.log(`Successfully migrated ${result.length} products to Atlas`);

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // 关闭连接
        if (localConnection) await localConnection.close();
        if (atlasConnection) await atlasConnection.close();
        process.exit(0);
    }
}

migrateData();
