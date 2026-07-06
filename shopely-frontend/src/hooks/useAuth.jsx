import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage token on page load/refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    axios
      .get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUser(res.data.user);
        // Re-attach token to all future axios calls
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Login failed. Check your credentials.",
      };
    }
  }

  async function register(name, email, password) {
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Registration failed.",
      };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
