// tests/cleanTestData.js
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

async function cleanTestData() {
  try {
    console.log("🧹 Starting test data cleanup...");

    // Delete in correct order to avoid foreign key constraints
    console.log("Deleting status updates...");
    await prisma.statusUpdate.deleteMany({});

    console.log("Deleting notifications...");
    await prisma.notification.deleteMany({});

    console.log("Deleting transactions...");
    await prisma.transaction.deleteMany({});

    console.log("Deleting parcels...");
    await prisma.parcel.deleteMany({});

    console.log("Deleting addresses...");
    await prisma.address.deleteMany({});

    console.log("Deleting test users...");
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        OR: [{ email: { contains: "test.com" } }, { email: { contains: "example.com" } }, { firstName: { contains: "Test" } }, { firstName: { contains: "Integration" } }],
      },
    });

    console.log(`✅ Cleanup completed successfully!`);
    console.log(`📊 Deleted ${deletedUsers.count} test users`);

    // Reset auto-increment sequences if needed (PostgreSQL specific)
    if (process.env.DATABASE_URL?.includes("postgresql")) {
      console.log("Resetting sequences...");
      await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"users"', 'id'), 1, false);`;
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  }
}

// Run cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanTestData()
    .then(() => {
      console.log("🎉 Test data cleanup completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Failed to clean test data:", error);
      process.exit(1);
    });
}

export { cleanTestData };
