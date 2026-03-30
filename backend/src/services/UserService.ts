import { IUserRepository } from "../repositories/UserRepository";
import { UserDocument } from "../models/UserSchema";
import Encrypt from "../utils/comparePassword";
import { CreateJWT } from "../utils/generateToken";
import { DatabaseError, NotFoundError } from "../utils/errors";

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private encrypt: Encrypt,
    private createJWT: CreateJWT,
  ) {}

  async userLogin(email: string, password: string) {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (user?.status === "blocked") {
        return {
          status: 401,
          data: {
            success: false,
            message: "You have been blocked by the admin!",
            token: undefined,
            data: user,
            refreshToken: undefined,
          },
        };
      }
      if (user?.password && password) {
        const passwordMatch = await this.encrypt.compare(
          password,
          user?.password as string,
        );
        if (passwordMatch) {
          const token = this.createJWT.generateToken(user?.id);
          const refreshToken = this.createJWT.generateRefreshToken(user?.id);
          return {
            status: 200,
            data: {
              success: true,
              message: "Authentication Successful !",
              data: user,
              userId: user.id,
              token: token,
              refreshToken: refreshToken,
            },
          };
        } else {
          return {
            status: 401,
            data: {
              success: false,
              message: "Authentication failed...",
            },
          };
        }
      } else {
        // Should not happen if emailExistCheck passes and user has password
        return {
          status: 401,
          data: {
            success: false,
            message: "Authentication failed due to missing password.",
          },
        };
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        return {
          status: 401,
          data: {
            success: false,
            message: "Authentication failed: User not found.",
          },
        };
      } else if (error instanceof DatabaseError) {
        console.error("Database error in userLogin:", error);
        return {
          status: 500,
          data: {
            success: false,
            message: "Internal server Error during login!",
          },
        };
      }
      console.error("Unexpected error in userLogin:", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "An unexpected error occurred during login!",
        },
      };
    }
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async createUser(userData: Omit<UserDocument, "_id">): Promise<UserDocument> {
    const user: Omit<UserDocument, "_id"> = { ...userData };
    return this.userRepository.create(user);
  }

  async updateUser(
    id: string,
    userData: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.userRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  async blockUser(id: string): Promise<UserDocument | null> {
    return this.userRepository.update(id, { status: "blocked" });
  }

  async unblockUser(id: string): Promise<UserDocument | null> {
    return this.userRepository.update(id, { status: "active" });
  }

  async getWishlist(userId: string): Promise<UserDocument | null> {
    return this.userRepository.getWishlist(userId);
  }

  async addToWishlist(
    userId: string,
    productId: string,
  ): Promise<UserDocument | null> {
    return this.userRepository.addToWishlist(userId, productId);
  }

  async removeFromWishlist(
    userId: string,
    productId: string,
  ): Promise<UserDocument | null> {
    return this.userRepository.removeFromWishlist(userId, productId);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = (await this.userRepository.findByEmail(
      email,
    )) as UserDocument | null;
    if (!user) return null;
    const isValid = await user.comparePassword(password);
    return isValid ? user : null;
  }
}
