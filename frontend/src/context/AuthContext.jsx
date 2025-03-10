import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data when app loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me", { withCredentials: true });
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // refresh user data (for updates)
  const updateUser = async () => {
    try {
      const res = await API.get("/users/me", { withCredentials: true });
      setUser(res.data); // Update user state
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
