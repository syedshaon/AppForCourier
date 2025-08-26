import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/auth.js";
import { createParcel, getUserParcels, getParcelById, updateParcelStatus, deleteParcel, getAllParcels, getParcelsByAgent, assignAgent, searchParcels, getParcelByTracking } from "../controllers/parcelController.js";
import { validateParcel, validateStatusUpdate } from "../middleware/validation.js";

const router = express.Router();

// Public route - track parcel by tracking number
router.get("/track/:trackingNumber", getParcelByTracking);

// Protected routes - require authentication
router.use(authenticate);

// Customer routes
// custom, agent, admin can create parcels
// router.post("/", authorize("CUSTOMER"), validateParcel, createParcel);
router.post("/", authorize("CUSTOMER", "AGENT", "ADMIN"), validateParcel, createParcel);
router.get("/my-parcels", authorize("CUSTOMER"), getUserParcels);

// Agent routes
router.get("/assigned", authorize("AGENT"), getParcelsByAgent);
router.patch("/:id/status", authorize("AGENT", "ADMIN"), validateStatusUpdate, updateParcelStatus);

// Admin routes
router.get("/", authorize("ADMIN"), getAllParcels);
router.get("/search", authorize("ADMIN"), searchParcels);
router.patch("/:id/assign", authorize("ADMIN"), assignAgent);
router.delete("/:id", authorize("ADMIN"), deleteParcel);

// Common routes (accessible by customer, agent, admin)
router.get("/:id", getParcelById);

export default router;
