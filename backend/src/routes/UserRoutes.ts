import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repositories/UserRepository";
import { UserModel } from "../models/UserSchema";
import jwt from "jsonwebtoken";
import Encrypt from "../utils/comparePassword";
import { CreateJWT } from "../utils/generateToken";
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

const router = Router();
const encrypt = new Encrypt();
const createJWT = new CreateJWT();

const userRepository = new UserRepository();
const userService = new UserService(userRepository, encrypt, createJWT);
const userController = new UserController(userService);

router.get("/", (req, res) => userController.getAllUsers(req, res));
router.get("/:id", (req, res) => userController.getUserById(req, res));
router.put("/:id", (req, res) => userController.updateUser(req, res));
router.delete("/:id", (req, res) => userController.deleteUser(req, res));
router.put("/:id/block", (req, res) => userController.blockUser(req, res));
router.put("/:id/unblock", (req, res) => userController.unblockUser(req, res));

//google authentication
router.post("/google-auth", async (req, res) => {
  const { credential, client_id } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: client_id,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    // Check if the user already exists in the database
    let user = await UserModel.findOne({ email });
    if (!user) {
      // Create a new user if they don't exist
      user = await UserModel.create({
        email,
        name: `${given_name} ${family_name}`,
        authSource: "google",
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET ?? "",
      {
        expiresIn: "1h", // Adjust expiration time as needed
      },
    );

    // Send the token as a cookie and response
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // Set to true in production when using HTTPS
        maxAge: 3600000, // 1 hour in milliseconds
      })
      .json({ message: "Authentication successful", user, token });
  } catch (err) {
    res.status(400).json({ err });
  }
});

export { router as userRoutes };
