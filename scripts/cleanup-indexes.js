// This script drops the problematic variants.sku_1 index
// Run this once to fix the duplicate key error

import mongoose from 'mongoose';

async function dropVariantSkuIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/next-commerce');
    
    // Get the products collection
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    // Drop the problematic index
    try {
      await collection.dropIndex('variants.sku_1');
      console.log('✅ Successfully dropped variants.sku_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index variants.sku_1 does not exist (already dropped)');
      } else {
        console.error('❌ Error dropping index:', error);
      }
    }
    
    // List remaining indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the cleanup
dropVariantSkuIndex();