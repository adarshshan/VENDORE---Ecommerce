import { Request, Response, NextFunction } from "express";
import { UserDocument } from "../models/UserSchema";
import { CreateJWT } from "../utils/generateToken";
import { UserRepository } from "../repositories/UserRepository";

const createJWT = new CreateJWT();
const userRepository = new UserRepository();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: UserDocument | null;
    }
  }
}
interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token = req.cookies.access_token;
  let refresh_token = req.cookies.refresh_token;

  if (!refresh_token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, please login again.",
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Refresh access token if missing
    if (!token) {
      console.log("Access token missing, attempting refresh...");
      const newAccessToken = await createJWT.refreshAccessToken(refresh_token);
      if (newAccessToken) {
        token = newAccessToken;
        const accessTokenMaxAge = 30 * 60 * 1000;
        res.cookie("access_token", token, {
          maxAge: accessTokenMaxAge,
          sameSite: "lax",
          secure: false,
          httpOnly: true,
        });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Session expired" });
      }
    }

    const decoded: any = createJWT.verifyToken(token);
    if (decoded?.success) {
      let user = await userRepository.findById(
        decoded.decoded?.data?.toString(),
      );
      if (user?.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "User is blocked by admin!",
        });
      } else {
        req.userId = decoded.decoded?.data?.toString();
        req.user = user;
        return next();
      }
    } else {
      // If token verification failed (e.g. expired during request), try one last refresh
      console.log("Token verification failed, trying one last refresh...");
      const newAccessToken = await createJWT.refreshAccessToken(refresh_token);
      if (newAccessToken) {
        // ... similar logic as above or just recurse/next if you want to be fancy
        // for simplicity, let's just reject and let the next request (which will have the cookie from step above if we set it) succeed
        return res
          .status(401)
          .json({ success: false, message: "Token expired, please retry" });
      }
      return res
        .status(401)
        .json({ success: false, message: decoded?.message || "Invalid token" });
    }
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};
