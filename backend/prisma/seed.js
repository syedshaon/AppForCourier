// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Hash password for seed users
  const hashedPassword = await bcrypt.hash("admin123", 12);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@courier.com" },
    update: {},
    create: {
      email: "admin@courier.com",
      password: hashedPassword,
      firstName: "System",
      lastName: "Administrator",
      phoneNumber: "+8801700000000",
      address: "Khulna, Bangladesh",
      role: "ADMIN",
      isActive: true,
    },
  });

  // Create Delivery Agent
  const agent1 = await prisma.user.upsert({
    where: { email: "agent1@courier.com" },
    update: {},
    create: {
      email: "agent1@courier.com",
      password: await bcrypt.hash("agent123", 12),
      firstName: "Rakib",
      lastName: "Ahmed",
      phoneNumber: "+8801700000001",
      address: "Dhaka, Bangladesh",
      role: "AGENT",
      isActive: true,
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: "agent2@courier.com" },
    update: {},
    create: {
      email: "agent2@courier.com",
      password: await bcrypt.hash("agent123", 12),
      firstName: "Fatima",
      lastName: "Khatun",
      phoneNumber: "+8801700000002",
      address: "Chittagong, Bangladesh",
      role: "AGENT",
      isActive: true,
    },
  });

  // Create Sample Customers
  const customer1 = await prisma.user.upsert({
    where: { email: "customer1@gmail.com" },
    update: {},
    create: {
      email: "customer1@gmail.com",
      password: await bcrypt.hash("customer123", 12),
      firstName: "Mohammad",
      lastName: "Rahman",
      phoneNumber: "+8801700000003",
      address: "Khulna, Bangladesh",
      role: "CUSTOMER",
      isActive: true,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "customer2@gmail.com" },
    update: {},
    create: {
      email: "customer2@gmail.com",
      password: await bcrypt.hash("customer123", 12),
      firstName: "Ayesha",
      lastName: "Begum",
      phoneNumber: "+8801700000004",
      address: "Sylhet, Bangladesh",
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // Create Sample Addresses
  const address1 = await prisma.address.create({
    data: {
      street: "123 Main Street, Sonadanga",
      city: "Khulna",
      state: "Khulna Division",
      zipCode: "9100",
      country: "Bangladesh",
      latitude: 22.8456,
      longitude: 89.5403,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      street: "456 Commercial Area, Wari",
      city: "Dhaka",
      state: "Dhaka Division",
      zipCode: "1203",
      country: "Bangladesh",
      latitude: 23.8103,
      longitude: 90.4125,
    },
  });

  const address3 = await prisma.address.create({
    data: {
      street: "789 Port Road, Agrabad",
      city: "Chittagong",
      state: "Chittagong Division",
      zipCode: "4100",
      country: "Bangladesh",
      latitude: 22.3569,
      longitude: 91.7832,
    },
  });

  const address4 = await prisma.address.create({
    data: {
      street: "321 Tea Garden Road, Zindabazar",
      city: "Sylhet",
      state: "Sylhet Division",
      zipCode: "3100",
      country: "Bangladesh",
      latitude: 24.8949,
      longitude: 91.8687,
    },
  });

  // Create Sample Parcels
  const parcel1 = await prisma.parcel.create({
    data: {
      customerId: customer1.id,
      agentId: agent1.id,
      pickupAddressId: address1.id,
      deliveryAddressId: address2.id,
      parcelSize: "MEDIUM",
      parcelType: "PACKAGE",
      weight: 2.5,
      description: "Electronics - Mobile Phone",
      paymentType: "COD",
      codAmount: 25000.0,
      shippingCost: 150.0,
      status: "ASSIGNED",
      pickupDate: new Date(),
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
  });

  const parcel2 = await prisma.parcel.create({
    data: {
      customerId: customer2.id,
      pickupAddressId: address4.id,
      deliveryAddressId: address3.id,
      parcelSize: "SMALL",
      parcelType: "DOCUMENT",
      weight: 0.5,
      description: "Legal Documents",
      paymentType: "PREPAID",
      shippingCost: 80.0,
      status: "PENDING",
      pickupDate: new Date(),
      expectedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    },
  });

  // Create Status Updates for parcel1
  await prisma.statusUpdate.create({
    data: {
      parcelId: parcel1.id,
      agentId: agent1.id,
      status: "PENDING",
      notes: "Parcel received and assigned to agent",
      latitude: address1.latitude,
      longitude: address1.longitude,
    },
  });

  await prisma.statusUpdate.create({
    data: {
      parcelId: parcel1.id,
      agentId: agent1.id,
      status: "ASSIGNED",
      notes: "Agent assigned and notified",
      latitude: address1.latitude,
      longitude: address1.longitude,
    },
  });

  // Create Sample Transactions
  await prisma.transaction.create({
    data: {
      parcelId: parcel2.id,
      userId: customer2.id,
      type: "PREPAID",
      amount: 80.0,
    },
  });

  // Create System Settings
  await prisma.systemSettings.createMany({
    data: [
      {
        key: "shipping_rate_per_kg",
        value: "50",
      },
      {
        key: "base_shipping_cost",
        value: "80",
      },
      {
        key: "max_cod_amount",
        value: "100000",
      },
      {
        key: "company_name",
        value: "Rui Courier",
      },
      {
        key: "company_email",
        value: "info@rui-courier.com",
      },
      {
        key: "company_phone",
        value: "+8801700000000",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Database seeding completed!");
  console.log("\n📋 Seeded Data Summary:");
  console.log(`👤 Admin: admin@courier.com (password: admin123)`);
  console.log(`🚚 Agent 1: agent1@courier.com (password: agent123)`);
  console.log(`🚚 Agent 2: agent2@courier.com (password: agent123)`);
  console.log(`👨‍💼 Customer 1: customer1@gmail.com (password: customer123)`);
  console.log(`👩‍💼 Customer 2: customer2@gmail.com (password: customer123)`);
  console.log(`📦 Created ${await prisma.parcel.count()} parcels`);
  console.log(`📍 Created ${await prisma.address.count()} addresses`);
  console.log(`⚙️ Created ${await prisma.systemSettings.count()} system settings`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

// package.json script addition
// Add this to your package.json scripts:
// "seed": "node prisma/seed.js"
