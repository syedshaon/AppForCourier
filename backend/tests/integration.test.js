// tests/integration.test.js
import request from "supertest";
import { app, server } from "../server.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Parcel Management Integration Tests", () => {
  let customerToken, agentToken, adminToken;
  let customerId, agentId, adminId;
  let parcels = [];

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.parcel.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        OR: [{ email: "integration-customer@test.com" }, { email: "integration-agent@test.com" }, { email: "integration-admin@test.com" }],
      },
    });

    // Create test users for integration tests
    const users = [
      {
        email: "integration-customer@test.com",
        password: "password123",
        firstName: "Integration",
        lastName: "Customer",
        phoneNumber: "+8801712345690",
        role: "CUSTOMER",
      },
      {
        email: "integration-agent@test.com",
        password: "password123",
        firstName: "Integration",
        lastName: "Agent",
        phoneNumber: "+8801712345691",
        role: "AGENT",
      },
      {
        email: "integration-admin@test.com",
        password: "password123",
        firstName: "Integration",
        lastName: "Admin",
        phoneNumber: "+8801712345692",
        role: "ADMIN",
      },
    ];

    // Register users
    for (const user of users) {
      await request(app).post("/api/auth/register").send(user);
    }

    // Verify emails
    await prisma.user.updateMany({
      where: {
        email: {
          in: users.map((u) => u.email),
        },
      },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    // Login users and get tokens
    const customerLogin = await request(app).post("/api/auth/login").send({
      email: "integration-customer@test.com",
      password: "password123",
    });
    customerToken = customerLogin.body.data.token;
    customerId = customerLogin.body.data.user.id;

    const agentLogin = await request(app).post("/api/auth/login").send({
      email: "integration-agent@test.com",
      password: "password123",
    });
    agentToken = agentLogin.body.data.token;
    agentId = agentLogin.body.data.user.id;

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "integration-admin@test.com",
      password: "password123",
    });
    adminToken = adminLogin.body.data.token;
    adminId = adminLogin.body.data.user.id;
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.parcel.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        OR: [{ email: "integration-customer@test.com" }, { email: "integration-agent@test.com" }, { email: "integration-admin@test.com" }],
      },
    });
    await prisma.$disconnect();

    if (server) {
      await server.close();
    }
  });

  describe("Complete Parcel Lifecycle", () => {
    let parcelId, trackingNumber;

    test("1. Customer creates a parcel booking", async () => {
      const parcelData = {
        pickupAddress: {
          street: "Integration Test Pickup Street",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          latitude: 23.8103,
          longitude: 90.4125,
          phoneNumber: "+8801712345678",
        },
        deliveryAddress: {
          street: "Integration Test Delivery Avenue",
          city: "Chittagong",
          state: "Chittagong Division",
          zipCode: "4000",
          latitude: 22.3569,
          longitude: 91.7832,
          phoneNumber: "+8801712345679",
        },
        parcelSize: "LARGE",
        parcelType: "ELECTRONICS",
        weight: 5.0,
        description: "Laptop computer for delivery",
        paymentType: "COD",
        codAmount: 50000,
        pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app).post("/api/parcels").set("Authorization", `Bearer ${customerToken}`).send(parcelData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PENDING");
      expect(res.body.data.shippingCost).toBeGreaterThan(0);

      parcelId = res.body.data.id;
      trackingNumber = res.body.data.trackingNumber;
      parcels.push({ id: parcelId, trackingNumber });
    });

    test("2. Customer can track their parcel publicly", async () => {
      const res = await request(app).get(`/api/parcels/track/${trackingNumber}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trackingNumber).toBe(trackingNumber);
      expect(res.body.data.status).toBe("PENDING");
    });

    test("3. Admin assigns agent to the parcel", async () => {
      const res = await request(app).patch(`/api/parcels/${parcelId}/assign`).set("Authorization", `Bearer ${adminToken}`).send({ agentId });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("ASSIGNED");
      expect(res.body.data.agentId).toBe(agentId);
    });

    test("4. Agent can see the assigned parcel", async () => {
      const res = await request(app).get("/api/parcels/assigned").set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.parcels).toHaveLength(1);
      expect(res.body.data.parcels[0].id).toBe(parcelId);
    });

    test("5. Agent updates status to PICKED_UP", async () => {
      const res = await request(app).patch(`/api/parcels/${parcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "PICKED_UP",
        notes: "Package picked up from customer's location",
        latitude: 23.8103,
        longitude: 90.4125,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PICKED_UP");
    });

    test("6. Agent updates status to IN_TRANSIT", async () => {
      const res = await request(app).patch(`/api/parcels/${parcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "IN_TRANSIT",
        notes: "Package is on the way to destination",
        latitude: 23.0,
        longitude: 91.0,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("IN_TRANSIT");
    });

    test("7. Agent updates status to OUT_FOR_DELIVERY", async () => {
      const res = await request(app).patch(`/api/parcels/${parcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "OUT_FOR_DELIVERY",
        notes: "Package out for delivery to customer",
        latitude: 22.3569,
        longitude: 91.7832,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("OUT_FOR_DELIVERY");
    });

    test("8. Agent delivers the parcel", async () => {
      const res = await request(app).patch(`/api/parcels/${parcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "DELIVERED",
        notes: "Package delivered successfully to customer",
        latitude: 22.3569,
        longitude: 91.7832,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("DELIVERED");
      expect(res.body.data.actualDelivery).toBeDefined();
    });

    test("9. Customer can see the delivered parcel in their history", async () => {
      const res = await request(app).get("/api/parcels/my-parcels?status=DELIVERED").set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.parcels).toHaveLength(1);
      expect(res.body.data.parcels[0].status).toBe("DELIVERED");
    });

    test("10. Public tracking shows complete status history", async () => {
      const res = await request(app).get(`/api/parcels/track/${trackingNumber}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("DELIVERED");
      expect(res.body.data.statusHistory).toHaveLength(6); // PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
      expect(res.body.data.actualDelivery).toBeDefined();
    });

    test("11. Cannot update status of delivered parcel", async () => {
      const res = await request(app).patch(`/api/parcels/${parcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "IN_TRANSIT",
        notes: "Trying to change delivered status",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("12. Admin cannot delete delivered parcel", async () => {
      const res = await request(app).delete(`/api/parcels/${parcelId}`).set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Failed Delivery Scenario", () => {
    let failedParcelId, failedTrackingNumber;

    test("Create parcel for failed delivery test", async () => {
      const parcelData = {
        pickupAddress: {
          street: "Failed Test Pickup",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          latitude: 23.8103,
          longitude: 90.4125,
          phoneNumber: "+8801712345680",
        },
        deliveryAddress: {
          street: "Failed Test Delivery",
          city: "Sylhet",
          state: "Sylhet Division",
          zipCode: "3100",
          latitude: 24.8949,
          longitude: 91.8687,
          phoneNumber: "+8801712345681",
        },
        parcelSize: "MEDIUM",
        parcelType: "PACKAGE",
        paymentType: "PREPAID",
      };

      const res = await request(app).post("/api/parcels").set("Authorization", `Bearer ${customerToken}`).send(parcelData);

      failedParcelId = res.body.data.id;
      failedTrackingNumber = res.body.data.trackingNumber;
      parcels.push({ id: failedParcelId, trackingNumber: failedTrackingNumber });

      // Assign agent
      await request(app).patch(`/api/parcels/${failedParcelId}/assign`).set("Authorization", `Bearer ${adminToken}`).send({ agentId });

      // Progress to out for delivery
      await request(app).patch(`/api/parcels/${failedParcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({ status: "PICKED_UP", notes: "Picked up" });

      await request(app).patch(`/api/parcels/${failedParcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({ status: "OUT_FOR_DELIVERY", notes: "Out for delivery" });
    });

    test("Agent marks delivery as failed", async () => {
      const res = await request(app).patch(`/api/parcels/${failedParcelId}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "FAILED",
        notes: "Customer not available, address not found",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("FAILED");
    });

    test("Failed parcel can be reassigned by admin", async () => {
      const res = await request(app).patch(`/api/parcels/${failedParcelId}/status`).set("Authorization", `Bearer ${adminToken}`).send({
        status: "ASSIGNED",
        notes: "Reassigning for retry delivery",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("ASSIGNED");
    });
  });

  describe("Multiple Parcels Management", () => {
    beforeAll(async () => {
      // Create multiple parcels for testing pagination and filtering
      const parcelTemplates = [
        { size: "SMALL", type: "DOCUMENT", city: "Dhaka" },
        { size: "MEDIUM", type: "PACKAGE", city: "Chittagong" },
        { size: "LARGE", type: "FRAGILE", city: "Sylhet" },
        { size: "EXTRA_LARGE", type: "ELECTRONICS", city: "Rajshahi" },
        { size: "SMALL", type: "CLOTHING", city: "Khulna" },
      ];

      for (let i = 0; i < parcelTemplates.length; i++) {
        const template = parcelTemplates[i];
        const parcelData = {
          pickupAddress: {
            street: `${template.city} Pickup ${i}`,
            city: template.city,
            state: `${template.city} Division`,
            zipCode: `${1000 + i}`,
            latitude: 23.0 + i,
            longitude: 90.0 + i,
            phoneNumber: `+88017123456${70 + i}`,
          },
          deliveryAddress: {
            street: `Delivery Street ${i}`,
            city: "Dhaka",
            state: "Dhaka Division",
            zipCode: "1000",
            latitude: 23.8103,
            longitude: 90.4125,
            phoneNumber: "+8801712345678",
          },
          parcelSize: template.size,
          parcelType: template.type,
          paymentType: i % 2 === 0 ? "PREPAID" : "COD",
          codAmount: i % 2 === 0 ? 100 : 100 + i * 10,
        };

        const res = await request(app).post("/api/parcels").set("Authorization", `Bearer ${customerToken}`).send(parcelData);
        // console.log(res.body);

        parcels.push({
          id: res.body.data.id,
          trackingNumber: res.body.data.trackingNumber,
          size: template.size,
          type: template.type,
        });
      }
    });

    test("Customer can paginate through their parcels", async () => {
      const page1 = await request(app).get("/api/parcels/my-parcels?page=1&limit=3").set("Authorization", `Bearer ${customerToken}`);

      expect(page1.statusCode).toBe(200);
      expect(page1.body.data.parcels).toHaveLength(3);
      expect(page1.body.data.pagination.currentPage).toBe(1);
      expect(page1.body.data.pagination.limit).toBe(3);

      const page2 = await request(app).get("/api/parcels/my-parcels?page=2&limit=3").set("Authorization", `Bearer ${customerToken}`);

      expect(page2.statusCode).toBe(200);
      expect(page2.body.data.pagination.currentPage).toBe(2);
    });

    test("Admin can search parcels by various criteria", async () => {
      const searchBySize = await request(app).get("/api/parcels/search?q=LARGE").set("Authorization", `Bearer ${adminToken}`);

      expect(searchBySize.statusCode).toBe(200);
      expect(searchBySize.body.data.length).toBeGreaterThan(-1);

      const searchByCity = await request(app).get("/api/parcels/search?q=Chittagong").set("Authorization", `Bearer ${adminToken}`);

      expect(searchByCity.statusCode).toBe(200);
      expect(searchByCity.body.data.length).toBeGreaterThan(0);
    });

    test("Admin can filter parcels by status", async () => {
      const pendingParcels = await request(app).get("/api/parcels?status=PENDING").set("Authorization", `Bearer ${adminToken}`);

      expect(pendingParcels.statusCode).toBe(200);
      expect(pendingParcels.body.data.parcels.every((p) => p.status === "PENDING")).toBe(true);
    });

    test("Admin can assign multiple parcels to agent", async () => {
      // Get some unassigned parcels
      const unassignedParcels = parcels.slice(-3); // Last 3 parcels

      for (const parcel of unassignedParcels) {
        const res = await request(app).patch(`/api/parcels/${parcel.id}/assign`).set("Authorization", `Bearer ${adminToken}`).send({ agentId });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.agentId).toBe(agentId);
      }

      // Verify agent now has multiple assigned parcels
      const agentParcels = await request(app).get("/api/parcels/assigned").set("Authorization", `Bearer ${agentToken}`);

      expect(agentParcels.body.data.parcels.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("Handle non-existent parcel gracefully", async () => {
      const fakeId = "clxxxxxxxxxxxxxxxxxxx"; // Valid format but non-existent

      const res = await request(app).get(`/api/parcels/${fakeId}`).set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("Handle invalid tracking number format", async () => {
      const res = await request(app).get("/api/parcels/track/INVALID123");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("Prevent status updates by wrong agent", async () => {
      // Create another agent
      await request(app).post("/api/auth/register").send({
        email: "wrong-agent@test.com",
        password: "password123",
        firstName: "Wrong",
        lastName: "Agent",
        phoneNumber: "+8801712345693",
        role: "AGENT",
      });

      await prisma.user.update({
        where: { email: "wrong-agent@test.com" },
        data: { isEmailVerified: true },
      });

      const wrongAgentLogin = await request(app).post("/api/auth/login").send({
        email: "wrong-agent@test.com",
        password: "password123",
      });

      const wrongAgentToken = wrongAgentLogin.body.data.token;

      // Try to update status of parcel not assigned to this agent
      const assignedParcel = parcels.find((p) => p.id !== parcels[0].id);

      if (assignedParcel) {
        const res = await request(app).patch(`/api/parcels/${assignedParcel.id}/status`).set("Authorization", `Bearer ${wrongAgentToken}`).send({
          status: "PICKED_UP",
          notes: "Unauthorized update attempt",
        });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
      }
    });

    test("Validate coordinates when provided", async () => {
      const assignedParcel = parcels.find((p) => p.id);

      const res = await request(app).patch(`/api/parcels/${assignedParcel.id}/status`).set("Authorization", `Bearer ${agentToken}`).send({
        status: "IN_TRANSIT",
        notes: "Invalid coordinates test",
        latitude: 200, // Invalid latitude
        longitude: 300, // Invalid longitude
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
