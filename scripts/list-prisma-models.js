const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('MODEL_KEYS', Object.keys(prisma).filter((key) => !key.startsWith('$') && !key.startsWith('_')).sort());

prisma.$disconnect();
