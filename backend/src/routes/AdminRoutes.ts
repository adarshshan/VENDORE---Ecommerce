import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { protect, admin } from "../middleware/auth";

const router = Router();
const adminController = new AdminController();

router.get("/dashboard", protect, admin, (req, res) => adminController.getDashboardStats(req, res));

export { router as adminRoutes };
