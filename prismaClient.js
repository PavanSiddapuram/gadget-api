// Description: This file exports the prisma client instance.

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = prisma;