import { create } from "zustand";
import { api, setAccessToken } from "../../shared/api/api-client";

export interface AuthUser {
  userId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  userType: "student" | "staff" | "provider" | "business";
  role: "user" | "admin";
  verificationStatus: "unverified" | "pending" | "verified";
  universityCode?: string;
  avatarUrl: string | null;
  bio?: string | null;
  address?: string | null;
  averageRating?: number;
  totalRatings?: number;
  totalTransactions?: number;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateUser: (partialUser: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  updateUser: (partialUser) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...partialUser } : null,
    }));
  },

  setAuth: (user, token) => {
    setAccessToken(token);
    set({ user, isAuthenticated: true, isInitialized: true, isLoading: false });
  },

  clearAuth: () => {
    setAccessToken(null);
    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
    });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, accessToken } = res.data.data;
      setAccessToken(accessToken);
      set({
        user: {
          ...user,
          avatarUrl: user.avatarUrl ?? null,
        },
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", payload);
      const { user, accessToken } = res.data.data;
      setAccessToken(accessToken);
      set({
        user: {
          ...user,
          avatarUrl: null,
        },
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    } finally {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchMe: async () => {
    try {
      // First attempt to refresh token via cookie
      const refreshRes = await api.post("/auth/refresh");
      const newToken = refreshRes.data?.data?.accessToken;
      if (newToken) {
        setAccessToken(newToken);
      }

      const res = await api.get("/users/me");
      const { user, profile } = res.data.data;
      set({
        user: {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          role: user.role,
          verificationStatus: user.verificationStatus,
          avatarUrl: profile?.avatarUrl ?? null,
          bio: profile?.bio,
          address: profile?.address,
          averageRating: profile?.averageRating ?? 0,
          totalRatings: profile?.totalRatings ?? 0,
          totalTransactions: profile?.totalTransactions ?? 0,
        },
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },
}));
