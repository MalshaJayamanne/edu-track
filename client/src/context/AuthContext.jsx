import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    setUser(res.data);
  };

  const register = async (data) => {
    const res = await API.post("/auth/register", data);
    setUser(res.data);
  };

  const logout = async () => {
    await API.post("/auth/logout");
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await API.put("/auth/profile", data);
    setUser(res.data);
    return res.data;
  };

  const reloadUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, reloadUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};