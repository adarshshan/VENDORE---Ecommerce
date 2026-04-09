import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { protect, admin } from "../middleware/auth";

const router = Router();
const adminController = new AdminController();

router.get("/dashboard", protect, admin, (req, res) => adminController.getDashboardStats(req, res));
router.get("/sellers", protect, admin, (req, res) => adminController.getSellers(req, res));
router.post("/seller/create", protect, admin, (req, res) => adminController.createSeller(req, res));
router.put("/seller/:id/block", protect, admin, (req, res) => adminController.blockSeller(req, res));
router.put("/seller/:id/unblock", protect, admin, (req, res) => adminController.unblockSeller(req, res));

export { router as adminRoutes };
