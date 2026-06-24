import React, { useState } from "react";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

const savedAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("store-rating-auth"));
  } catch {
    return null;
  }
};

export default function App() {
  const [auth, setAuth] = useState(savedAuth);

  function handleAuth(data) {
    localStorage.setItem("store-rating-auth", JSON.stringify(data));
    setAuth(data);
  }

  function logout() {
    localStorage.removeItem("store-rating-auth");
    setAuth(null);
  }

  if (!auth?.token) {
    return <AuthPage onAuth={handleAuth} />;
  }

  if (auth.user.role === "ADMIN") {
    return <AdminDashboard auth={auth} onLogout={logout} />;
  }

  if (auth.user.role === "OWNER") {
    return <OwnerDashboard auth={auth} onLogout={logout} />;
  }

  return <UserDashboard auth={auth} onLogout={logout} />;
}
