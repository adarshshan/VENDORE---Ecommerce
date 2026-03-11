import { IUserRepository } from "../repositories/UserRepository";
import { UserDocument } from "../models/UserSchema";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

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
    userData: Partial<UserDocument>
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

  async validateUser(
    email: string,
    password: string
  ): Promise<UserDocument | null> {
    const user = (await this.userRepository.findByEmail(
      email
    )) as UserDocument | null;
    if (!user) return null;
    const isValid = await user.comparePassword(password);
    return isValid ? user : null;
  }
}
