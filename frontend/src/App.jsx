import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import ProfileUpdate from "./pages/ProfileUpdate";

const AppRoutes = () => {
  const { user } = useAuth(); // Get user from context

  return (
    <Routes>
      {/* Redirect logged-in users away from the login page */}
      <Route
        path="/"
        element={user ? <Navigate to="/chat" replace /> : <Login />}
      />

      {/* Protected routes - Only accessible if user is logged in */}
      <Route
        path="/chat"
        element={user ? <Chat /> : <Navigate to="/" replace />}
      />
      <Route
        path="/profile"
        element={user ? <ProfileUpdate /> : <Navigate to="/profile" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
