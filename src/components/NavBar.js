import React from "react";
import Logo from "../assets/LogoW.png";
import "../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser } from "@fortawesome/free-solid-svg-icons";

export default function NavBar({ onLogout }) {
  return (
    <header className="flex items-center bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500">
      <div className="flex justify-start items-center w-1/5 mr-auto ml-1 h-full">
        <a href="#" className="">
          <FontAwesomeIcon
            icon={faBars}
            style={{ color: "#ffffff" }}
            className="border-b-2 border-transparent hover:border-white px-2.5 py-2 mx-1"
            size="lg"
          />
        </a>
        <div>
          <img src={Logo} alt="Logo" className="ml-[1px]" />
        </div>
      </div>
      <div className="flex items-center justify-end mr-5">
        <a
          className="ml-5 border-b-2 py-2 px-2 border-transparent hover:border-white"
          href="#"
        >
          <FontAwesomeIcon icon={faUser} style={{ color: "#ffffff" }} />
        </a>
      </div>
      <div>
        <button className="border bg-white rounded mr-1" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
