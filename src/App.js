import React, { useState, useEffect } from "react";
import Main from "./components/Main";
import Auth from "./components/Auth";
import "./index.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    setIsLoggedIn(loggedIn);
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      localStorage.setItem("loggedIn", "true");
      setIsLoading(false);
    }, 2000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("loggedIn");
  };

  return (
    <div
      id="App"
      className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="loader"></div>
        </div>
      ) : isLoggedIn ? (
        <>
          <Main onLogout={handleLogout}/>
        </>
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </div>
  );
}
