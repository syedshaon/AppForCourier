import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/auth.js";
import { getAllAgents } from "../controllers/usersController.js";
const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);
// Admin routes
router.get("/admin/agents", authorize("ADMIN"), getAllAgents);
export default router;
