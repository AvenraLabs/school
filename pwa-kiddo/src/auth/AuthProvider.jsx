import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { setupAxiosInterceptors } from "../api/axios.interceptors";
import api from "../api/axios";
import { validateToken, logoutApi } from "../api/auth.api";
import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../api/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState(() => getSavedAccounts());

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

  // Get saved accounts helper
  function getSavedAccounts() {
    try {
      const accs = localStorage.getItem("accounts");
      return accs ? JSON.parse(accs) : {};
    } catch {
      return {};
    }
  }

  // Save accounts helper
  function saveAccounts(accs) {
    localStorage.setItem("accounts", JSON.stringify(accs));
    setAccounts(accs);
  }

  // ---------- bootstrap (restore session) ----------
  useEffect(() => {
    const accs = getSavedAccounts();
    const activeId = localStorage.getItem("activeUserId");
    
    const cleanedAccs = {};
    let activeAccount = null;

    Object.keys(accs).forEach((key) => {
      const acc = accs[key];
      const decoded = decodeToken(acc.token);
      if (decoded && !isTokenExpired(decoded) && validateToken(acc.token)) {
        cleanedAccs[key] = acc;
        if (String(key) === String(activeId)) {
          activeAccount = acc;
        }
      }
    });

    saveAccounts(cleanedAccs);

    if (activeAccount) {
      setToken(activeAccount.token);
      setUser(decodeToken(activeAccount.token));
      localStorage.setItem("token", activeAccount.token);
      localStorage.setItem("activeUserId", activeAccount.user.id);
    } else {
      const remainingIds = Object.keys(cleanedAccs);
      if (remainingIds.length > 0) {
        const firstId = remainingIds[0];
        const acc = cleanedAccs[firstId];
        setToken(acc.token);
        setUser(decodeToken(acc.token));
        localStorage.setItem("token", acc.token);
        localStorage.setItem("activeUserId", acc.user.id);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("activeUserId");
        localStorage.removeItem("accounts");
        setToken(null);
        setUser(null);
      }
    }
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
            const accs = getSavedAccounts();
            accs[decoded.id] = { token: newToken, user: decoded };
            saveAccounts(accs);
            localStorage.setItem("token", newToken);
            localStorage.setItem("activeUserId", decoded.id);
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
        const rejectionReason = data?.rejection_reason || normalized?.rejection_reason || null;

        if (!cancelled) {
          setUser((prev) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              name: normalized?.name ?? prev?.name,
              phone: normalized?.phone ?? prev?.phone,
              email: normalized?.email ?? prev?.email,
              avatar_url: avatarUrl || prev?.avatar_url || "",
              // Always update approval_status so RequireApproval reads from context
              ...(approvalStatus !== null ? { approval_status: approvalStatus } : {}),
              rejection_reason: rejectionReason,
            };
            if (updated.id) {
              const accs = getSavedAccounts();
              if (accs[updated.id]) {
                accs[updated.id].user = { ...accs[updated.id].user, ...updated };
                saveAccounts(accs);
              }
            }
            return updated;
          });
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

  // Request browser notification permission on token change
  useEffect(() => {
    if (token && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [token]);

  // Connect to notification socket for push alerts
  useEffect(() => {
    if (!token || !user) return;

    let socket;
    try {
      const baseUrl = SOCKET_BASE_URL || import.meta.env.VITE_API_URL || "";
      socket = io(baseUrl, {
        path: "/api/socket.io",
        auth: { token },
      });

      socket.on("notification:new", (notif) => {
        // Check targeting
        const role = user.role;
        const matchesRole = notif.target_role === "all" || notif.target_role === role;

        let matchesScope = true;
        if (role === "student") {
          if (notif.class_id && Number(notif.class_id) !== Number(user.class_id)) {
            matchesScope = false;
          }
          if (notif.section_id && Number(notif.section_id) !== Number(user.section_id)) {
            matchesScope = false;
          }
        }

        if (matchesRole && matchesScope) {
          // Check if today matches specific_dates or start_date/end_date range
          const today = new Date().toISOString().split("T")[0];
          let isDisplayToday = false;

          if (notif.is_poster) {
            if (notif.specific_dates && Array.isArray(notif.specific_dates) && notif.specific_dates.length > 0) {
              isDisplayToday = notif.specific_dates.includes(today);
            } else if (notif.start_date && notif.end_date) {
              isDisplayToday = notif.start_date <= today && notif.end_date >= today;
            }
          } else {
            isDisplayToday = true;
          }

          if (isDisplayToday) {
            // Trigger browser native notification
            if ("Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(notif.title, {
                  body: notif.message,
                  icon: "/icon-192.png",
                });
              } catch (err) {
                console.error("Browser push notification failed:", err);
              }
            }

            // Dispatch client events to trigger refresh
            window.dispatchEvent(new Event("notifications:refresh"));
            if (notif.is_poster) {
              window.dispatchEvent(new Event("posters:refresh"));
            }
          }
        }
      });
    } catch (err) {
      console.error("Notification socket connection failed:", err);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, user]);

  // ---------- actions ----------
  function login(jwt) {
    try {
      setError(null);

      if (!jwt) throw new Error("No token provided");
      if (!validateToken(jwt)) throw new Error("Invalid token format");

      const decoded = decodeToken(jwt);

      if (!decoded || isTokenExpired(decoded)) throw new Error("Token is expired");
      if (!decoded.id || !decoded.role) throw new Error("Token missing required fields");

      // Save to accounts list
      const accs = getSavedAccounts();
      accs[decoded.id] = { token: jwt, user: decoded };
      saveAccounts(accs);

      localStorage.setItem("token", jwt);
      localStorage.setItem("activeUserId", decoded.id);
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
      const currentUserId = user?.id;
      const accs = getSavedAccounts();
      if (currentUserId) {
        delete accs[currentUserId];
        saveAccounts(accs);
      }

      const remainingIds = Object.keys(accs);
      if (remainingIds.length > 0) {
        const nextId = remainingIds[0];
        const nextAcc = accs[nextId];
        localStorage.setItem("token", nextAcc.token);
        localStorage.setItem("activeUserId", nextAcc.user.id);
        setToken(nextAcc.token);
        const decoded = decodeToken(nextAcc.token);
        setUser(decoded);
        return decoded;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("accounts");
        localStorage.removeItem("activeUserId");
        setToken(null);
        setUser(null);
        return null;
      }
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

  // Switch to another logged-in user profile
  function switchAccount(userId) {
    try {
      const accs = getSavedAccounts();
      const target = accs[userId];
      if (!target) throw new Error("Account not found");

      localStorage.setItem("token", target.token);
      localStorage.setItem("activeUserId", target.user.id);
      setToken(target.token);
      setUser(decodeToken(target.token));
      return target.user;
    } catch (err) {
      setError(err.message || "Switch failed");
      throw err;
    }
  }

  // Sign out current state to trigger login form, keeping other saved accounts
  function addAccount() {
    localStorage.removeItem("token");
    localStorage.removeItem("activeUserId");
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    error,
    updateUser: (partial) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...partial };
        if (updated.id) {
          const accs = getSavedAccounts();
          if (accs[updated.id]) {
            accs[updated.id].user = { ...accs[updated.id].user, ...partial };
            saveAccounts(accs);
          }
        }
        return updated;
      });
    },
    login,
    logout,
    switchAccount,
    addAccount,
    accounts: Object.values(accounts),
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
