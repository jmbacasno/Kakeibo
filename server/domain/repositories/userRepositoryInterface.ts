import { UserEntity } from "../entities/user/index.js";

export interface UserRepositoryInterface {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
}
