import { create } from "zustand";
import { setToken as saveToken, clearToken } from "@church/shared";
import type { UserRole, MemberType, ApprovalStatus } from "@church/shared";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  memberType?: MemberType;
  approvalStatus?: ApprovalStatus;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  restore: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isApproved: true,

  setAuth: (user, token) => {
    saveToken(token);
    localStorage.setItem("church_user", JSON.stringify(user));
    set({
      user,
      isAuthenticated: true,
      isAdmin: user.role === "admin",
      isApproved: (user.approvalStatus || "approved") === "approved",
    });
  },

  logout: () => {
    clearToken();
    localStorage.removeItem("church_user");
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isApproved: true,
    });
  },

  restore: () => {
    const stored = localStorage.getItem("church_user");
    if (stored) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.role === "admin",
          isApproved: (user.approvalStatus || "approved") === "approved",
        });
      } catch {
        localStorage.removeItem("church_user");
      }
    }
  },
}));