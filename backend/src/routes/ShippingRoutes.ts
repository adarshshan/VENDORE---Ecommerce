import { Router } from "express";
import { ShippingController } from "../controllers/ShippingController";

const router = Router();
const shippingController = new ShippingController();

router.post("/validate-pincode", (req, res) =>
  shippingController.validatePincode(req, res),
);

export { router as shippingRoutes };
