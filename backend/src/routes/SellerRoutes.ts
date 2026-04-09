import { Router } from "express";
import { SellerController } from "../controllers/SellerController";
import { ProductRepository } from "../repositories/ProductRepository";
import { OrderRepository } from "../repositories/OrderRepository";
import { protect, seller } from "../middleware/auth";

const router = Router();
const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();
const sellerController = new SellerController(productRepository, orderRepository);

// Public seller routes
router.post("/login", (req, res) => sellerController.login(req, res));

// Protected seller routes
router.get("/products", protect, seller, (req, res) => sellerController.getInventory(req, res));
router.put("/product/:id/quantity", protect, seller, (req, res) => sellerController.updateQuantity(req, res));
router.get("/orders", protect, seller, (req, res) => sellerController.getOrders(req, res));
router.put("/order/:id/book", protect, seller, (req, res) => sellerController.bookOrder(req, res));

export {router as sellerRoutes};
