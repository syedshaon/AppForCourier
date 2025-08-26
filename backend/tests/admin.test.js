import request from "supertest";
import { app, server } from "../server.js";
import { prisma } from "../utils/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Admin Endpoints", () => {
  let adminToken;
  let agentToken;
  let customerToken;
  let testAdminId;
  let testAgentId;
  let testCustomerId;
  let testCustomer2Id;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["admin@test.com", "agent@test.com", "customer@test.com", "customer2@test.com"],
        },
      },
    });

    // Create test users with different roles
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        phoneNumber: "+8801711111111",
        role: "ADMIN",
        isEmailVerified: true,
        isActive: true,
      },
    });
    testAdminId = adminUser.id;

    // Create agent user
    const agentUser = await prisma.user.create({
      data: {
        email: "agent@test.com",
        password: hashedPassword,
        firstName: "Agent",
        lastName: "User",
        phoneNumber: "+8801722222222",
        role: "AGENT",
        isEmailVerified: true,
        isActive: true,
      },
    });
    testAgentId = agentUser.id;

    // Create customer user
    const customerUser = await prisma.user.create({
      data: {
        email: "customer@test.com",
        password: hashedPassword,
        firstName: "Customer",
        lastName: "User",
        phoneNumber: "+8801733333333",
        role: "CUSTOMER",
        isEmailVerified: true,
        isActive: true,
      },
    });
    testCustomerId = customerUser.id;

    // Create another customer user
    const customerUser2 = await prisma.user.create({
      data: {
        email: "customer2@test.com",
        password: hashedPassword,
        firstName: "Customer2",
        lastName: "User",
        phoneNumber: "+8801744444444",
        role: "CUSTOMER",
        isEmailVerified: true,
        isActive: true,
      },
    });
    testCustomer2Id = customerUser2.id;

    // Generate tokens for testing
    adminToken = jwt.sign({ id: testAdminId, email: "admin@test.com", role: "ADMIN" }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });

    agentToken = jwt.sign({ id: testAgentId, email: "agent@test.com", role: "AGENT" }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });

    customerToken = jwt.sign({ id: testCustomerId, email: "customer@test.com", role: "CUSTOMER" }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["admin@test.com", "agent@test.com", "customer@test.com", "customer2@test.com"],
        },
      },
    });
    await prisma.$disconnect();

    // Close the server
    if (server) {
      await server.close();
    }
  });

  // Test 1: Get all users (admin access)
  test("GET /api/admin/users - should get all users (admin only)", async () => {
    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.users).toBeInstanceOf(Array);
    expect(res.body.data.pagination).toBeDefined();
  });

  // Test 2: Get all users with role filter
  test("GET /api/admin/users?role=CUSTOMER - should get customers only", async () => {
    const res = await request(app).get("/api/admin/users?role=CUSTOMER").set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.users).toBeInstanceOf(Array);

    // All returned users should be CUSTOMER role
    res.body.data.users.forEach((user) => {
      expect(user.role).toEqual("CUSTOMER");
    });
  });

  // Test 3: Get all users with search
  test("GET /api/admin/users?search=customer - should search users", async () => {
    const res = await request(app).get("/api/admin/users?search=customer").set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.users.length).toBeGreaterThan(0);
  });

  // Test 4: Get user by ID
  test("GET /api/admin/users/:id - should get user by ID", async () => {
    const res = await request(app).get(`/api/admin/users/${testCustomerId}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.id).toEqual(testCustomerId);
    expect(res.body.data.user.email).toEqual("customer@test.com");
  });

  // Test 5: Update user role (agent to customer)
  test("PATCH /api/admin/users/:id/role - should change agent role to customer", async () => {
    const res = await request(app).patch(`/api/admin/users/${testAgentId}/role`).set("Authorization", `Bearer ${adminToken}`).send({ role: "CUSTOMER" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.role).toEqual("CUSTOMER");

    // Verify the change in database
    const updatedUser = await prisma.user.findUnique({
      where: { id: testAgentId },
    });
    expect(updatedUser.role).toEqual("CUSTOMER");
  });

  // Test 6: Update user role (customer to agent)
  test("PATCH /api/admin/users/:id/role - should change customer role to agent", async () => {
    const res = await request(app).patch(`/api/admin/users/${testCustomerId}/role`).set("Authorization", `Bearer ${adminToken}`).send({ role: "AGENT" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.role).toEqual("AGENT");

    // Verify the change in database
    const updatedUser = await prisma.user.findUnique({
      where: { id: testCustomerId },
    });
    expect(updatedUser.role).toEqual("AGENT");
  });

  // Test 7: Deactivate user
  test("PATCH /api/admin/users/:id/deactivate - should deactivate user", async () => {
    const res = await request(app).patch(`/api/admin/users/${testCustomer2Id}/deactivate`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.isActive).toEqual(false);

    // Verify the change in database
    const updatedUser = await prisma.user.findUnique({
      where: { id: testCustomer2Id },
    });
    expect(updatedUser.isActive).toEqual(false);
    expect(updatedUser.refreshToken).toBeNull(); // Sessions should be invalidated
  });

  // Test 8: Activate user
  test("PATCH /api/admin/users/:id/activate - should activate user", async () => {
    const res = await request(app).patch(`/api/admin/users/${testCustomer2Id}/activate`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.isActive).toEqual(true);

    // Verify the change in database
    const updatedUser = await prisma.user.findUnique({
      where: { id: testCustomer2Id },
    });
    expect(updatedUser.isActive).toEqual(true);
  });

  // Test 9: Prevent self-role change
  test("PATCH /api/admin/users/:id/role - should prevent self-role change", async () => {
    const res = await request(app).patch(`/api/admin/users/${testAdminId}/role`).set("Authorization", `Bearer ${adminToken}`).send({ role: "CUSTOMER" });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  // Test 10: Prevent changing admin role
  test("PATCH /api/admin/users/:id/role - should prevent changing admin role", async () => {
    // First create another admin for testing
    const anotherAdmin = await prisma.user.create({
      data: {
        email: `admin2-${Date.now()}@test.com`, // Make email unique
        password: await bcrypt.hash("password123", 12),
        firstName: "Admin",
        lastName: "Two",
        phoneNumber: "+8801700000002",
        role: "ADMIN",
        isActive: true,
        isEmailVerified: true,
      },
    });

    const res = await request(app).patch(`/api/admin/users/${anotherAdmin.id}/role`).set("Authorization", `Bearer ${adminToken}`).send({ role: "AGENT" });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);

    // Clean up
    await prisma.user.delete({ where: { id: anotherAdmin.id } });
  });

  // Test 11: Access denied for non-admin users (agent)
  test("GET /api/admin/users - should deny access to agent", async () => {
    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${agentToken}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  // Test 12: Access denied for non-admin users (customer)
  test("GET /api/admin/users - should deny access to customer", async () => {
    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  // Test 13: Access denied without token
  test("GET /api/admin/users - should deny access without token", async () => {
    const res = await request(app).get("/api/admin/users");

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  // Test 14: Invalid role update
  test("PATCH /api/admin/users/:id/role - should reject invalid role", async () => {
    const res = await request(app).patch(`/api/admin/users/${testCustomerId}/role`).set("Authorization", `Bearer ${adminToken}`).send({ role: "INVALID_ROLE" });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  // Test 15: User not found
  test("GET /api/admin/users/nonexistent - should return 404 for non-existent user", async () => {
    const res = await request(app).get("/api/admin/users/nonexistent-id-123").set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toEqual(false);
  });
});
