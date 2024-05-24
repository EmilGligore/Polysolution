import React from "react";
import Logo from "../assets/LogoW.png";
import "../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function NavBar({ onLogout }) {
  return (
    <header className="flex items-center bg-inherit hadow-[35px_0_60px_-15px_rgba(0,0,0,0.3)]">
      <div className="flex justify-start items-center w-1/5 mr-auto ml-1 h-full">
        <div>
          <img src={Logo} alt="Logo" className="ml-[1px] w-3/4" />
        </div>
      </div>
      <div className="flex items-center justify-end mr-5">
        <button
          className="ml-5 border-b-2 py-2 px-2 border-transparent hover:border-white"
          href=""
        >
          <FontAwesomeIcon icon={faUser} style={{ color: "#ffffff" }} />
        </button>
      </div>
      <div>
        <button className="border bg-white rounded mr-1" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
