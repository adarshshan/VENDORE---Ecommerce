import { Router } from "express";
import { ContactController } from "../controllers/ContactController";
import { protect, admin } from "../middleware/auth";

const router = Router();
const contactController = new ContactController();

// Public route to submit contact form
router.post("/", (req, res) => contactController.submitContact(req, res));

// Admin routes to manage contact messages
router.get("/", protect, admin, (req, res) => contactController.getAllContacts(req, res));
router.patch("/:id", protect, admin, (req, res) => contactController.updateStatus(req, res));

export { router as contactRoutes };
