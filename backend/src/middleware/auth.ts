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
  console.log("Protect Middleware Hit");
  console.log("All Cookies:", req.cookies);
  console.log("Cookie header:", req.headers.cookie);

  let token = req.cookies.access_token;
  let refresh_token = req.cookies.refresh_token;

  // Fallback to Authorization header if cookies are missing (common in some cross-domain setups)
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
    console.log("DEBUG: Using token from Authorization header");
  }

  if (!refresh_token && !token) {
    console.log("DEBUG: Both refresh token and access token are missing");
    return res.status(401).json({
      success: false,
      message: "Not authorized, please login again.",
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.log("its hitting here !process.env.JWT_SECRET");
      throw new Error("JWT_SECRET is not defined");
    }

    // Refresh access token if missing
    if (!token) {
      const newAccessToken = await createJWT.refreshAccessToken(refresh_token);
      if (newAccessToken) {
        token = newAccessToken;
        const accessTokenMaxAge = 30 * 60 * 1000;
        res.cookie("access_token", token, {
          maxAge: accessTokenMaxAge,
          sameSite: "none",
          secure: true,
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
    console.log(
      "the issue is coming from inside the catch block protect middlware",
    );
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

export const seller = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a seller" });
  }
};
