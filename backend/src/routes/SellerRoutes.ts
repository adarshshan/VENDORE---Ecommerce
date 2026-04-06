import { Router, Request, Response, NextFunction } from "express";
import { SellerController } from "../controllers/SellerController";
import { ProductRepository } from "../repositories/ProductRepository";
import { OrderRepository } from "../repositories/OrderRepository";

const router = Router();
const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();
const sellerController = new SellerController(productRepository, orderRepository);

const verifySellerAccess = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["x-seller-token"];
  const sellerToken = process.env.SELLER_TOKEN || "seller-secret-token";

  if (token === sellerToken) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Unauthorized seller access",
  });
};

// Public seller routes
router.post("/login", (req, res) => sellerController.login(req, res));

// Protected seller routes
router.get("/products", verifySellerAccess, (req, res) => sellerController.getInventory(req, res));
router.put("/product/:id/quantity", verifySellerAccess, (req, res) => sellerController.updateQuantity(req, res));
router.get("/orders", verifySellerAccess, (req, res) => sellerController.getOrders(req, res));
router.put("/order/:id/book", verifySellerAccess, (req, res) => sellerController.bookOrder(req, res));

export default router;
