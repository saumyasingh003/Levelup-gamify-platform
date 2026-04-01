"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Live Activity Heartbeat (Every 5 minutes)
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        try {
          await api.post("/progress/activity/heartbeat");
          console.log("Activity Heartbeat Sent");
        } catch (err) {
          console.error("Heartbeat error:", err);
        }
      }, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
