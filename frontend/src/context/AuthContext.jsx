import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Fetch user data when app loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me", { withCredentials: true });
        setUser(res.data);

        connectSocket(res.data);
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
      setUser(res.data);
      connectSocket(res.data); // reconnect socket with updated user data
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const connectSocket = (userdata) => {
    if (!userdata) return;

    // prevent duplicate sockets
    if (socket?.connected) return;

    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        withCredentials: true,
      }
    );

    setSocket(newSocket);

    // on connect event - join user room
    newSocket.on("connect", () => {
      console.log("Connected:", newSocket.id);
      newSocket.emit("join", userdata._id);
    });

    //  receive online users
    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Online users:", userIds);
      setOnlineUsers(userIds);
    });

    // cleanup on unmount
    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, updateUser, onlineUsers, socket }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
