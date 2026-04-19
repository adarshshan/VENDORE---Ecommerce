import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { ProductService } from "../services/ProductService";
import { ProductRepository } from "../repositories/ProductRepository";
import upload from "../middleware/multer";

const router = Router();
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get("/", (req, res) => productController.getAllProducts(req, res));
router.get("/related/:productId", (req, res) => productController.getRelatedProducts(req, res));
router.get("/slug/:slug", (req, res) => productController.getProductBySlug(req, res));
router.get("/:id", (req, res) => productController.getProductById(req, res));
router.post("/", upload.array("images"), (req, res) =>
  productController.createProduct(req, res)
);
router.put("/:id", upload.array("images"), (req, res) => productController.updateProduct(req, res));
router.delete("/:id", (req, res) => productController.deleteProduct(req, res));

export { router as productRoutes };
