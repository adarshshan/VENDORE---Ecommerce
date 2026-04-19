import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { CategoryService } from "../services/CategoryService";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { protect, admin } from "../middleware/auth";

const router = Router();
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

// Public routes
router.get("/", (req, res) => categoryController.getAllCategories(req, res));
router.get("/slug/:slug", (req, res) => categoryController.getCategoryBySlug(req, res));
router.get("/:id", (req, res) => categoryController.getCategoryById(req, res));

// Admin routes
router.post("/", protect, admin, (req, res) => categoryController.createCategory(req, res));
router.put("/:id", protect, admin, (req, res) => categoryController.updateCategory(req, res));
router.delete("/:id", protect, admin, (req, res) => categoryController.deleteCategory(req, res));

export { router as categoryRoutes };
