import api from "./axios";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getRetryDelay, shouldRetry } from "../utils/apiErrorHandler";
import { API_BASE_URL } from "./config";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function setupAxiosInterceptors({ onLogout, onTokenRefresh }) {
  // ----- Request -----
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add retry configuration to request
      config.retryCount = config.retryCount || 0;
      config.maxRetries = config.maxRetries || 3;

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ----- Response -----
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle retry logic for network and server errors (except 401/403)
      if (shouldRetry(error, originalRequest.retryCount, originalRequest.maxRetries)) {
        originalRequest.retryCount += 1;
        const delayTime = getRetryDelay(originalRequest.retryCount);

        if (import.meta.env.DEV) {
          console.log(`Retrying request (${originalRequest.retryCount}/${originalRequest.maxRetries}) after ${delayTime}ms`);
        }

        await delay(delayTime);
        return api(originalRequest);
      }

      // Handle 401 errors (unauthorized / token expired)
      if (error.response?.status === 401 && !originalRequest._retry) {
        const isLoginRequest = originalRequest?.url && originalRequest.url.includes("/auth/login");
        const isRefreshRequest = originalRequest?.url && originalRequest.url.includes("/auth/refresh");

        if (isLoginRequest || isRefreshRequest) {
          return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          onLogout();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          const newToken = refreshRes.data.accessToken || refreshRes.data.token;
          const newRefreshToken = refreshRes.data.refreshToken;

          localStorage.setItem("token", newToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          if (onTokenRefresh) {
            onTokenRefresh(newToken);
          }

          processQueue(null, newToken);
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          onLogout();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle 403 errors (forbidden)
      if (error.response?.status === 403) {
        const errorMessage = error.response.data?.message || "Access forbidden";

        if (errorMessage.includes("Profile completion required")) {
          console.log("Profile completion required");
        } else if (errorMessage.includes("approval")) {
          console.log("User approval required");
        }
      }

      // Enhanced error logging in development
      if (import.meta.env.DEV) {
        console.error("API Error:", {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          retryCount: originalRequest?.retryCount || 0,
        });
      }

      return Promise.reject(error);
    }
  );
}
