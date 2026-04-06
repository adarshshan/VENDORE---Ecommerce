import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export class CreateJWT {
  generateToken(payload: string | undefined): string | undefined {
    if (payload) {
      const token = jwt.sign(
        { data: payload },
        process.env.JWT_SECRET as Secret,
        { expiresIn: "30m" },
      );
      console.log(`token is :${token}`);
      return token;
    }
    return undefined;
  }

  generateRefreshToken(payload: string | undefined): string | undefined {
    if (payload) {
      return jwt.sign(
        { data: payload },
        process.env.JWT_REFRESH_SECRET as Secret,
        { expiresIn: "48h" },
      );
    }
    return undefined;
  }

  verifyToken(token: string): {
    success: boolean;
    decoded?: JwtPayload;
    message?: string;
  } {
    try {
      const secret = process.env.JWT_SECRET as Secret;
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return { success: true, decoded };
    } catch (err: any) {
      console.error("Error while verifying JWT token:", err);
      if (err?.name === "TokenExpiredError")
        return { success: false, message: "Token Expired!" };
      else return { success: false, message: "Internal server error" };
    }
  }

  verifyRefreshToken(token: string): {
    success: boolean;
    decoded?: JwtPayload;
    message?: string;
  } {
    try {
      if (!token || typeof token !== "string") {
        throw new Error("jwt must be a string");
      }
      const secret = process.env.JWT_REFRESH_SECRET as Secret;
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return { success: true, decoded };
    } catch (error: any) {
      console.log("Error in verifyRefreshToken:", error.message);
      return { success: false, message: error.message };
    }
  }

  refreshAccessToken = async (
    refreshToken: string,
  ): Promise<string | undefined> => {
    try {
      if (!refreshToken) throw new Error("No refresh token found");

      const result = this.verifyRefreshToken(refreshToken);
      if (!result.success || !result.decoded) {
        throw new Error(result.message || "Invalid refresh token");
      }

      const newAccessToken = this.generateToken(result.decoded.data);
      return newAccessToken;
    } catch (error: any) {
      console.log("Error in refreshAccessToken:", error.message);
      throw new Error("Invalid refresh token");
    }
  };
}
