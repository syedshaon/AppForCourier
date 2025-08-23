// tests/auth.test.js
import request from "supertest";
import { app, server } from "../server.js";
import { prisma } from "../utils/prisma.js";

describe("Auth Endpoints", () => {
  let authToken; // access token
  let refreshToken; // refresh token
  let testUserId;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: { email: "test@example.com" },
    });
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.user.deleteMany({
      where: { email: "test@example.com" },
    });
    await prisma.$disconnect();

    // Close the server
    if (server) {
      await server.close();
    }
  });

  // tests/auth.test.js
  test("POST /api/auth/register - should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+8801712345678",
      address: "123 Main St, Dhaka",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.email).toEqual("test@example.com");
    testUserId = res.body.data.user.id;

    // MANUALLY VERIFY THE EMAIL FOR TESTING
    await prisma.user.update({
      where: { id: testUserId },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });
  });

  test("POST /api/auth/register - should reject duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
      phoneNumber: "+8801712345679",
      address: "456 Main St, Dhaka",
    });

    expect(res.statusCode).toEqual(409);
    expect(res.body.success).toEqual(false);
  });

  test("POST /api/auth/login - should login with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined(); // Make sure this exists

    authToken = res.body.data.token;
    refreshToken = res.body.data.refreshToken; // Store the refresh token
  });

  test("POST /api/auth/login - should reject invalid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  test("GET /api/auth/profile - should get user profile with valid token", async () => {
    const res = await request(app).get("/api/auth/profile").set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.email).toEqual("test@example.com");
  });

  test("GET /api/auth/profile - should reject request without token", async () => {
    const res = await request(app).get("/api/auth/profile");

    console.log("Response status:", res.statusCode);
    console.log("Response body:", JSON.stringify(res.body, null, 2));

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  // test("GET /api/auth/profile - should reject request without token", async () => {
  //   const res = await request(app).get("/api/auth/profile");

  //   expect(res.statusCode).toEqual(401);
  //   expect(res.body.success).toEqual(false);
  // });

  test("PUT /api/auth/profile - should update user profile", async () => {
    const res = await request(app).put("/api/auth/profile").set("Authorization", `Bearer ${authToken}`).send({
      firstName: "Johnny",
      lastName: "Smith",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.firstName).toEqual("Johnny");
  });

  test("POST /api/auth/refresh - should refresh token", async () => {
    const res = await request(app).post("/api/auth/refresh").send({
      token: refreshToken, // Send refresh token, not access token
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined(); // Should get new refresh token

    // Update tokens for subsequent tests if needed
    authToken = res.body.data.token;
    refreshToken = res.body.data.refreshToken;
  });
});
