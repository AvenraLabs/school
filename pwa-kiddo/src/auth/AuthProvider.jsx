import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { setupAxiosInterceptors } from "../api/axios.interceptors";
import api from "../api/axios";
import { validateToken, logoutApi } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------- helpers ----------
  function decodeToken(jwt) {
    try {
      return jwtDecode(jwt);
    } catch {
      return null;
    }
  }

  function isTokenExpired(decoded) {
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
  }

  // ---------- bootstrap (restore session) ----------
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    if (!validateToken(storedToken)) {
      console.warn("Stored token is invalid, clearing session");
      localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    const decoded = decodeToken(storedToken);

    if (!decoded || isTokenExpired(decoded)) {
      console.warn("Stored token is expired, clearing session");
      localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(decoded);
    setLoading(false);
  }, []);

  // ---------- axios interceptors (ONCE) ----------
  useEffect(() => {
    setupAxiosInterceptors({
      onLogout: logout,
      onTokenRefresh: (newToken) => {
        if (newToken && validateToken(newToken)) {
          const decoded = decodeToken(newToken);
          if (decoded && !isTokenExpired(decoded)) {
            localStorage.setItem("token", newToken);
            setToken(newToken);
            setUser(decoded);
          }
        }
      },
    });
  }, []);

  // ---------- hydrate user profile (name/avatar) ----------
  useEffect(() => {
    if (!token || !user?.role) return;

    let cancelled = false;

    async function fetchProfile() {
      try {
        let res;
        if (user.role === "student") res = await api.get("/students/me");
        else if (user.role === "teacher") res = await api.get("/teachers/me");
        else return;

        const data = res.data;
        const normalized = data?.user ? { ...data, ...data.user } : data;
        const avatarUrl = normalized?.avatar_url || normalized?.avatar || "";
        // approval_status lives on the profile object (student/teacher row), not the user row
        const approvalStatus = data?.approval_status || normalized?.approval_status || null;

        if (!cancelled) {
          setUser((prev) => ({
            ...prev,
            name: normalized?.name ?? prev?.name,
            phone: normalized?.phone ?? prev?.phone,
            email: normalized?.email ?? prev?.email,
            avatar_url: avatarUrl || prev?.avatar_url || "",
            // Always update approval_status so RequireApproval reads from context
            ...(approvalStatus !== null ? { approval_status: approvalStatus } : {}),
          }));
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn("Profile hydrate failed:", err?.message || err);
        }
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [token, user?.role]);

  // ---------- actions ----------
  function login(jwt) {
    try {
      setError(null);

      if (!jwt) throw new Error("No token provided");
      if (!validateToken(jwt)) throw new Error("Invalid token format");

      const decoded = decodeToken(jwt);

      if (!decoded || isTokenExpired(decoded)) throw new Error("Token is expired");
      if (!decoded.id || !decoded.role) throw new Error("Token missing required fields");

      localStorage.setItem("token", jwt);
      setToken(jwt);
      setUser(decoded);

      return decoded;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  async function logout() {
    try {
      setError(null);
      await logoutApi();
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }

  async function refreshToken() {
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken || !validateToken(currentToken)) {
        throw new Error("No valid token to refresh");
      }
      const decoded = decodeToken(currentToken);
      if (decoded && !isTokenExpired(decoded)) {
        return decoded;
      } else {
        throw new Error("Token expired");
      }
    } catch (error) {
      setError(error.message);
      logout();
      throw error;
    }
  }

  // Switch to a sibling student account (no re-login)
  async function switchStudent(targetStudentId) {
    try {
      const res = await api.post("/auth/switch-student", { target_student_id: targetStudentId });
      const { token: newToken } = res.data;
      return login(newToken);
    } catch (err) {
      setError(err?.response?.data?.message || "Switch failed");
      throw err;
    }
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    error,
    updateUser: (partial) =>
      setUser((prev) => (prev ? { ...prev, ...partial } : partial)),
    login,
    logout,
    switchStudent,
    refreshToken,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------- hook ----------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
