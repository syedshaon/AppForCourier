import express from "express";
import { getAllUsers, getUserById, updateUserRole, deactivateUser, activateUser } from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { validate, updateRoleSchema } from "../middleware/validation.js";

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticate);

// Admin-only routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", validate(updateRoleSchema), updateUserRole);
router.patch("/users/:id/deactivate", deactivateUser);
router.patch("/users/:id/activate", activateUser);

export default router;
