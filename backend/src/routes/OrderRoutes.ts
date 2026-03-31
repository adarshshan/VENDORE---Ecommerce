import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { protect, admin } from "../middleware/auth";

const router = Router();
const orderController = new OrderController();

router.post("/create-razorpay-order", protect, (req, res) => orderController.createRazorpayOrder(req, res));
router.post("/verify-payment", protect, (req, res) => orderController.verifyPayment(req, res));

// Admin routes
router.get("/", protect, admin, (req, res) => orderController.getAllOrders(req, res));
router.put("/:id/status", protect, admin, (req, res) => orderController.updateOrderStatus(req, res));
router.put("/:id/return", protect, admin, (req, res) => orderController.handleReturnRequest(req, res));

// User routes
router.post("/", protect, (req, res) => orderController.createOrder(req, res));
router.get("/myorders", protect, (req, res) => orderController.getMyOrders(req, res));
router.post("/:id/cancel", protect, (req, res) => orderController.cancelOrder(req, res));
router.post("/return-request", protect, (req, res) => orderController.requestReturn(req, res));
router.get("/:id", protect, (req, res) => orderController.getOrderById(req, res));

export { router as orderRoutes };
