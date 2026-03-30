import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repositories/UserRepository";
import Encrypt from "../utils/comparePassword";
import { CreateJWT } from "../utils/generateToken";
import { protect } from "../middleware/auth";

const router = Router();
const encrypt = new Encrypt();
const createJWT = new CreateJWT();

const userRepository = new UserRepository();
const userService = new UserService(userRepository, encrypt, createJWT);
const userController = new UserController(userService, createJWT);

router.get("/", protect, (req, res) => userController.getWishlist(req, res));
router.post("/add", protect, (req, res) =>
  userController.addToWishlist(req, res),
);
router.delete("/remove/:productId", protect, (req, res) =>
  userController.removeFromWishlist(req, res),
);

export { router as wishlistRoutes };
