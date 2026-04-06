import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repositories/UserRepository";
import Encrypt from "../utils/comparePassword";
import { CreateJWT } from "../utils/generateToken";

const router = Router();
const encrypt = new Encrypt();
const createJWT = new CreateJWT();

const userRepository = new UserRepository();
const userService = new UserService(userRepository, encrypt, createJWT);
const userController = new UserController(userService, createJWT);

router.get("/", (req, res) => userController.getAllUsers(req, res));
router.get("/:id", (req, res) => userController.getUserById(req, res));
router.put("/:id", (req, res) => userController.updateUser(req, res));
router.delete("/:id", (req, res) => userController.deleteUser(req, res));
router.put("/:id/block", (req, res) => userController.blockUser(req, res));
router.put("/:id/unblock", (req, res) => userController.unblockUser(req, res));

//google authentication
router.post("/google-auth", (req, res) =>userController.googleSignIn(req,res));

export { router as userRoutes };
