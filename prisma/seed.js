const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertUser(username, password, role) {
  const passwordHash = await hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    await prisma.user.update({ where: { username }, data: { passwordHash, role, isActive: true } });
    console.log("Updated: " + username);
  } else {
    await prisma.user.create({ data: { username, passwordHash, role, isActive: true } });
    console.log("Created: " + username);
  }
}

async function main() {
  await upsertUser("superadmin", "SuperAdmin@2025", "super_admin");
  await upsertUser("admin",      "Admin@2025",      "admin");
  await upsertUser("employee",   "Employee@2025",   "employee");
}

main().catch(console.error).finally(() => prisma.$disconnect());
