import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import Main from "./components/Main";
import SideBar from "./components/SideBar";
import Auth from "./components/Auth";
import "./index.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("loggedIn");
  };

  return (
    <div>
      {isLoggedIn ? (
        <>
          <NavBar onLogout={handleLogout} />
          <Main />
        </>
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </div>
  );
}
