import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Main from "./components/Main";
import Auth from "./components/Auth";
import Admin from "./admin/Admin";
import "./index.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const userData = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(loggedIn);
    setUser(userData);
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setUser(userData);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", JSON.stringify(userData));
      setIsLoading(false);
    }, 2000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
  };

  return (
    <div
      id="App"
      className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500 h-screen w-screen overflow-hidden"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="loader"></div>
        </div>
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={isLoggedIn ? <Navigate to={user?.email === "admin@admin.com" ? "/admin" : "/components"} /> : <Auth onLogin={handleLogin} />} />
            <Route path="/admin" element={isLoggedIn && user?.email === "admin@admin.com" ? <Admin onLogout={handleLogout} /> : <Navigate to="/" />} />
            <Route path="/components" element={isLoggedIn ? <Main onLogout={handleLogout} /> : <Navigate to="/" />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}
