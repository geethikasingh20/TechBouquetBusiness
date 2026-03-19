import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchProfile } from "../data/api";

const AuthContext = createContext();

const AUTH_KEY = "techbouquet_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.token) {
        setProfile(null);
        return;
      }
      try {
        const data = await fetchProfile(user.token);
        setProfile(data);
      } catch (error) {
        setProfile(null);
      }
    };
    loadProfile();
  }, [user]);

  const login = (payload) => {
    setUser(payload);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setProfile(null);
  };

  const verifyEmail = () => {
    if (user) {
      setUser({ ...user, emailVerified: true });
    }
  };

  const value = useMemo(() => ({ user, profile, login, logout, verifyEmail }), [user, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
