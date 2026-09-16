import { getApi } from "../api";
import type { ApiResponse, User } from "../types";

export const usersApi = {
  async getProfile(): Promise<User> {
    const { data } = await getApi().get<ApiResponse<User>>("/users/profile");
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getAllUsers(): Promise<User[]> {
    const { data } = await getApi().get<ApiResponse<User[]>>("/users");
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};