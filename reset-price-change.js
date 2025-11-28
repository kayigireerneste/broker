// Run this script to reset all priceChange values to 0.00
// Usage: node reset-price-change.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetPriceChange() {
  try {
    console.log('Resetting all priceChange values to 0.00...');
    
    const result = await prisma.company.updateMany({
      data: {
        priceChange: '0.00',
      },
    });
    
    console.log(`✅ Successfully reset priceChange for ${result.count} companies`);
    console.log('Now make a new trade to see the correct priceChange calculation!');
  } catch (error) {
    console.error('❌ Error resetting priceChange:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPriceChange();
