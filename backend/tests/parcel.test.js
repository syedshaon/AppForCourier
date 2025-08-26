// tests/parcel.test.js
import request from "supertest";
import { app, server } from "../server.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Parcel Endpoints", () => {
  let customerToken, agentToken, adminToken;
  let customerId, agentId, adminId;
  let testParcelId, trackingNumber;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.parcel.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        OR: [{ email: "customer11@test.com" }, { email: "agent11@test.com" }, { email: "admin11@test.com" }],
      },
    });

    // Create test users
    const customerRes = await request(app).post("/api/auth/register").send({
      email: "customer11@test.com",
      password: "password123",
      firstName: "John",
      lastName: "Customer",
      phoneNumber: "+8801762345678",
      address: "123 Customer St, Dhaka",
      role: "CUSTOMER",
    });

    customerId = customerRes.body.data.user.id;

    const agentRes = await request(app).post("/api/auth/register").send({
      email: "agent11@test.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Agent",
      phoneNumber: "+8801752345679",
      address: "456 Agent Ave, Dhaka",
      role: "AGENT",
    });

    agentId = agentRes.body.data.user.id;

    const adminRes = await request(app).post("/api/auth/register").send({
      email: "admin11@test.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      phoneNumber: "+8801772345680",
      address: "789 Admin Blvd, Dhaka",
      role: "ADMIN",
    });

    adminId = adminRes.body.data.user.id;

    // Manually verify all test users
    await prisma.user.updateMany({
      where: {
        OR: [{ email: "customer11@test.com" }, { email: "agent11@test.com" }, { email: "admin11@test.com" }],
      },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    // Login all test users to get tokens
    const customerLogin = await request(app).post("/api/auth/login").send({
      email: "customer11@test.com",
      password: "password123",
    });
    customerToken = customerLogin.body.data.token;

    const agentLogin = await request(app).post("/api/auth/login").send({
      email: "agent11@test.com",
      password: "password123",
    });
    agentToken = agentLogin.body.data.token;

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin11@test.com",
      password: "password123",
    });
    adminToken = adminLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.parcel.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        OR: [{ email: "customer11@test.com" }, { email: "agent11@test.com" }, { email: "admin11@test.com" }],
      },
    });
    await prisma.$disconnect();

    // Close the server
    if (server) {
      await server.close();
    }
  });

  describe("Parcel Creation", () => {
    test("POST /api/parcels - should create a new parcel (Customer)", async () => {
      const parcelData = {
        pickupAddress: {
          street: "123 Pickup Street",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          latitude: 23.8103,
          longitude: 90.4125,
          phoneNumber: "+8801762345678", // Add this
        },
        deliveryAddress: {
          street: "456 Delivery Avenue",
          city: "Chittagong",
          state: "Chittagong Division",
          zipCode: "4000",
          latitude: 22.3569,
          longitude: 91.7832,
          phoneNumber: "+8801752345679", // Add this
        },
        parcelSize: "MEDIUM",
        parcelType: "PACKAGE",
        weight: 2.5,
        description: "Test package for delivery",
        paymentType: "COD",
        codAmount: 1500,
        pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      };

      const res = await request(app).post("/api/parcels").set("Authorization", `Bearer ${customerToken}`).send(parcelData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.trackingNumber).toBeDefined();
      expect(res.body.data.trackingNumber).toMatch(/^CMS\d{14}$/);
      expect(res.body.data.status).toEqual("PENDING");
      expect(res.body.data.shippingCost).toBeGreaterThan(0);
      expect(res.body.data.qrCode).toBeDefined();

      testParcelId = res.body.data.id;
      trackingNumber = res.body.data.trackingNumber;
    });

    test("POST /api/parcels - should validate required fields", async () => {
      const invalidData = {
        pickupAddress: {
          street: "123 Test St",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          phoneNumber: "+8801762345678", // Add this
          // Missing required fields
        },
        parcelSize: "INVALID_SIZE",
      };

      const res = await request(app).post("/api/parcels").set("Authorization", `Bearer ${customerToken}`).send(invalidData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.errors).toBeDefined();
    });

    test("POST /api/parcels - should validate COD amount when payment type is COD", async () => {
      const parcelData = {
        pickupAddress: {
          street: "123 Pickup Street",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          phoneNumber: "+8801762345678", // Add this
        },
        deliveryAddress: {
          street: "456 Delivery Avenue",
          city: "Chittagong",
          state: "Chittagong Division",
          zipCode: "4000",
          phoneNumber: "+8801752345679", // Add this
        },
        parcelSize: "SMALL",
        parcelType: "DOCUMENT",
        paymentType: "COD",
        // Missing codAmount for COD payment
      };

      const res = await request(app).post("/api/parcels").set("Authorization", `Bearer ${customerToken}`).send(parcelData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toEqual(false);
    });

    test("POST /api/parcels - should reject unauthorized access", async () => {
      const parcelData = {
        pickupAddress: {
          street: "123 Test St",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          phoneNumber: "+8801762345678", // Add this
        },
        deliveryAddress: {
          street: "456 Test Ave",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          phoneNumber: "+8801752345679", // Add this
        },
        parcelSize: "SMALL",
        parcelType: "DOCUMENT",
        paymentType: "PREPAID",
      };

      const res = await request(app).post("/api/parcels").send(parcelData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toEqual(false);
    });

    test("POST /api/parcels - should reject agent trying to create parcel", async () => {
      const parcelData = {
        pickupAddress: {
          street: "123 Test St",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          phoneNumber: "+8801762345678", // Add this
        },
        deliveryAddress: {
          street: "456 Test Ave",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          phoneNumber: "+8801752345679", // Add this
        },
        parcelSize: "SMALL",
        parcelType: "DOCUMENT",
        paymentType: "PREPAID",
      };

      const res = await request(app).post("/api/parcels").set("Authorization", `Bearer ${agentToken}`).send(parcelData);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toEqual(false);
    });
  });

  describe("Parcel Retrieval", () => {
    test("GET /api/parcels/my-parcels - should get customer's parcels", async () => {
      const res = await request(app).get("/api/parcels/my-parcels").set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.parcels).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.parcels.length).toBeGreaterThan(0);
    });

    test("GET /api/parcels/my-parcels - should support pagination", async () => {
      const res = await request(app).get("/api/parcels/my-parcels?page=1&limit=5").set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.pagination.currentPage).toEqual(1);
      expect(res.body.data.pagination.limit).toEqual(5);
    });

    test("GET /api/parcels/my-parcels - should filter by status", async () => {
      const res = await request(app).get("/api/parcels/my-parcels?status=PENDING").set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    test("GET /api/parcels/:id - should get single parcel by ID", async () => {
      const res = await request(app).get(`/api/parcels/${testParcelId}`).set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.id).toEqual(testParcelId);
      expect(res.body.data.pickupAddress).toBeDefined();
      expect(res.body.data.deliveryAddress).toBeDefined();
      expect(res.body.data.statusUpdates).toBeDefined();
    });

    test("GET /api/parcels/:id - should reject access to other customer's parcel", async () => {
      // Create another customer
      await request(app).post("/api/auth/register").send({
        email: "customer2@test.com",
        password: "password123",
        firstName: "Jane",
        lastName: "Customer2",
        phoneNumber: "+8801712345681",
      });

      await prisma.user.update({
        where: { email: "customer2@test.com" },
        data: { isEmailVerified: true },
      });

      const loginRes = await request(app).post("/api/auth/login").send({
        email: "customer2@test.com",
        password: "password123",
      });

      const customer2Token = loginRes.body.data.token;

      const res = await request(app).get(`/api/parcels/${testParcelId}`).set("Authorization", `Bearer ${customer2Token}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toEqual(false);
    });

    test("GET /api/parcels/track/:trackingNumber - should track parcel publicly", async () => {
      const res = await request(app).get(`/api/parcels/track/${trackingNumber}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.trackingNumber).toEqual(trackingNumber);
      expect(res.body.data.status).toBeDefined();
      expect(res.body.data.pickupCity).toBeDefined();
      expect(res.body.data.deliveryCity).toBeDefined();
      expect(res.body.data.statusHistory).toBeDefined();

      // Should not expose sensitive customer data
      expect(res.body.data.customer).toBeUndefined();
      expect(res.body.data.codAmount).toBeUndefined();
    });

    test("GET /api/parcels/track/:trackingNumber - should return 404 for invalid tracking", async () => {
      const res = await request(app).get("/api/parcels/track/INVALID123");

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toEqual(false);
    });
  });

  describe("Admin Operations", () => {
    test("GET /api/parcels - should get all parcels (Admin)", async () => {
      const res = await request(app).get("/api/parcels").set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.parcels).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toBeDefined();
    });

    test("GET /api/parcels - should reject non-admin access", async () => {
      const res = await request(app).get("/api/parcels").set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toEqual(false);
    });

    test("GET /api/parcels/search - should search parcels (Admin)", async () => {
      const res = await request(app).get(`/api/parcels/search?q=${trackingNumber}`).set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    test("PATCH /api/parcels/:id/assign - should assign agent to parcel", async () => {
      const res = await request(app).patch(`/api/parcels/${testParcelId}/assign`).set("Authorization", `Bearer ${adminToken}`).send({ agentId });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.agentId).toEqual(agentId);
      expect(res.body.data.status).toEqual("ASSIGNED");
    });

    test("PATCH /api/parcels/:id/assign - should reject invalid agent ID", async () => {
      const res = await request(app).patch(`/api/parcels/${testParcelId}/assign`).set("Authorization", `Bearer ${adminToken}`).send({ agentId: "invalid_id" });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toEqual(false);
    });

    test("PATCH /api/parcels/:id/assign - should reject non-admin access", async () => {
      const res = await request(app).patch(`/api/parcels/${testParcelId}/assign`).set("Authorization", `Bearer ${customerToken}`).send({ agentId });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toEqual(false);
    });
  });

  describe("Agent Operations", () => {
    test("GET /api/parcels/assigned - should get agent's assigned parcels", async () => {
      const res = await request(app).get("/api/parcels/assigned").set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.parcels).toBeInstanceOf(Array);
      expect(res.body.data.parcels.length).toBeGreaterThan(0);
    });

    test("PATCH /api/parcels/:id/status - should update parcel status (Agent)", async () => {
      const res = await request(app).patch(`/api/parcels/${testParcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "PICKED_UP",
        notes: "Package picked up from customer",
        latitude: 23.8103,
        longitude: 90.4125,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.status).toEqual("PICKED_UP");
    });

    test("PATCH /api/parcels/:id/status - should validate status transitions", async () => {
      const res = await request(app).patch(`/api/parcels/${testParcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "INVALID_STATUS",
        notes: "Invalid status update",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toEqual(false);
    });

    test("PATCH /api/parcels/:id/status - should reject unassigned agent", async () => {
      // Clean up any existing agent2 first
      await prisma.user.deleteMany({
        where: {
          OR: [{ email: "agent2@test.com" }, { phoneNumber: "+8801712345682" }],
        },
      });

      // Create another agent with unique credentials
      const registerRes = await request(app).post("/api/auth/register").send({
        email: "agent2@test.com",
        password: "password123",
        firstName: "Bob",
        lastName: "Agent2",
        phoneNumber: "+8801712345682", // Make sure this is unique
        role: "AGENT",
      });

      if (registerRes.statusCode !== 201) {
        console.error("Registration failed:", registerRes.body);
        throw new Error("Agent registration failed");
      }

      // Manually verify the agent
      await prisma.user.update({
        where: { email: "agent2@test.com" },
        data: {
          isEmailVerified: true,
          emailVerifyToken: null,
          emailVerifyExpires: null,
        },
      });

      const loginRes = await request(app).post("/api/auth/login").send({
        email: "agent2@test.com",
        password: "password123",
      });

      if (loginRes.statusCode !== 200) {
        console.error("Login failed:", loginRes.body);
        throw new Error("Agent login failed");
      }

      const agent2Token = loginRes.body.data.token;

      const res = await request(app).patch(`/api/parcels/${testParcelId}/status`).set("Authorization", `Bearer ${agent2Token}`).send({
        status: "IN_TRANSIT",
        notes: "Unauthorized status update",
      });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toEqual(false);
    });

    test("PATCH /api/parcels/:id/status - should update to delivered with timestamp", async () => {
      const res = await request(app).patch(`/api/parcels/${testParcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "DELIVERED",
        notes: "Package delivered successfully",
        latitude: 22.3569,
        longitude: 91.7832,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.status).toEqual("DELIVERED");
      expect(res.body.data.actualDelivery).toBeDefined();
    });
  });

  describe("Parcel Deletion", () => {
    let deletableParcelId;

    beforeAll(async () => {
      // Create a parcel that can be deleted (PENDING status)
      const parcelData = {
        pickupAddress: {
          street: "Delete Test Street",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          phoneNumber: "+8801762345678", // Add this
        },
        deliveryAddress: {
          street: "Delete Test Avenue",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          phoneNumber: "+8801752345679", // Add this
        },
        parcelSize: "SMALL",
        parcelType: "DOCUMENT",
        paymentType: "PREPAID",
      };

      const res = await request(app).post("/api/parcels").set("Authorization", `Bearer ${customerToken}`).send(parcelData);

      deletableParcelId = res.body.data.id;
    });

    test("DELETE /api/parcels/:id - should delete parcel (Admin)", async () => {
      const res = await request(app).delete(`/api/parcels/${deletableParcelId}`).set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    test("DELETE /api/parcels/:id - should not delete delivered parcel", async () => {
      const res = await request(app).delete(`/api/parcels/${testParcelId}`).set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toEqual(false);
    });

    test("DELETE /api/parcels/:id - should reject non-admin access", async () => {
      const res = await request(app).delete(`/api/parcels/${testParcelId}`).set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toEqual(false);
    });
  });
});
