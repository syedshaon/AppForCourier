import request from "supertest";
import { app, server } from "../server.js";
import { prisma } from "../utils/prisma.js";

describe("Auth Endpoints", () => {
  let authToken; // access token
  let refreshTokenCookie; // refresh token cookie string
  let testUserId;
  let agent; // SuperTest agent to maintain cookies

  beforeAll(async () => {
    // Create a SuperTest agent to maintain cookies across requests
    agent = request.agent(app);

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

  test("POST /api/auth/register - should register a new user", async () => {
    const res = await agent.post("/api/auth/register").send({
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
    const res = await agent.post("/api/auth/register").send({
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
    const res = await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.token).toBeDefined();

    // Check for refresh token cookie
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();

    const refreshTokenCookie = cookies.find((cookie) => cookie.includes("refreshtoken="));
    expect(refreshTokenCookie).toBeDefined();

    authToken = res.body.data.token;
  });

  test("POST /api/auth/login - should reject invalid credentials", async () => {
    const res = await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  test("GET /api/auth/profile - should get user profile with valid token", async () => {
    const res = await agent.get("/api/auth/profile").set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.email).toEqual("test@example.com");
  });

  test("GET /api/auth/profile - should reject request without token", async () => {
    const res = await agent.get("/api/auth/profile");

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  test("PUT /api/auth/profile - should update user profile", async () => {
    const res = await agent.put("/api/auth/profile").set("Authorization", `Bearer ${authToken}`).send({
      firstName: "Johnny",
      lastName: "Smith",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.user.firstName).toEqual("Johnny");
  });

  test("POST /api/auth/refresh - should refresh token using cookie", async () => {
    // First, make sure we have a refresh token cookie by logging in again
    const loginRes = await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    authToken = loginRes.body.data.token;

    // Now test refresh endpoint
    const refreshRes = await agent.post("/api/auth/refresh");

    expect(refreshRes.statusCode).toEqual(200);
    expect(refreshRes.body.success).toEqual(true);
    expect(refreshRes.body.data.token).toBeDefined();

    // Should get new refresh token cookie
    const newCookies = refreshRes.headers["set-cookie"];
    expect(newCookies).toBeDefined();

    authToken = refreshRes.body.data.token;
  });

  test("POST /api/auth/refresh - should fail without refresh token cookie", async () => {
    // Create a new agent without cookies
    const newAgent = request.agent(app);

    const res = await newAgent.post("/api/auth/refresh");

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  test("POST /api/auth/logout - should logout user", async () => {
    const res = await agent.post("/api/auth/logout").set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);

    // Verify refresh token cookie is cleared
    const cookies = res.headers["set-cookie"];
    const logoutCookie = cookies.find((cookie) => cookie.includes("refreshtoken=;") || cookie.includes("refreshtoken=null"));
    expect(logoutCookie).toBeDefined();
  });
});
