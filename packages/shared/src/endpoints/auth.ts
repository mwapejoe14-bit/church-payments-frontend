import { getApi } from "../api";
import type {
  ApiResponse,
  AuthPayload,
  ExtendedRegisterPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types";

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthPayload> {
    const { data } = await getApi().post<ApiResponse<AuthPayload>>(
      "/auth/register",
      payload
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async signup(payload: ExtendedRegisterPayload): Promise<AuthPayload> {
    const { data } = await getApi().post<ApiResponse<AuthPayload>>(
      "/auth/register",
      payload
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async login(payload: LoginPayload): Promise<AuthPayload> {
    const { data } = await getApi().post<ApiResponse<AuthPayload>>(
      "/auth/login",
      payload
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await getApi().post<ApiResponse<null>>(
      "/auth/forgot-password",
      { email }
    );
    if (!data.success) throw new Error(data.message);
    return { message: data.message || "Reset email sent" };
  },

  async resetPassword(token: string, password: string): Promise<void> {
    const { data } = await getApi().post<ApiResponse<null>>(
      `/auth/reset-password/${token}`,
      { password }
    );
    if (!data.success) throw new Error(data.message);
  },

  async verifyResetToken(token: string): Promise<boolean> {
    try {
      const { data } = await getApi().get<ApiResponse<unknown>>(
        `/auth/verify-reset-token/${token}`
      );
      return data.success;
    } catch {
      return false;
    }
  },

  async getPendingUsers(): Promise<User[]> {
    const { data } = await getApi().get<ApiResponse<User[]>>(
      "/admin/pending-users"
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async approveUser(
    userId: string,
    status: "approved" | "rejected"
  ): Promise<User> {
    const { data } = await getApi().post<ApiResponse<User>>(
      `/admin/approve/${userId}`,
      { status }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};