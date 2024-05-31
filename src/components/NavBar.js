import React from "react";
import "../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function NavBar({ onLogout, title }) {
  return (
    <div className="flex items-center bg-white hadow-[35px_0_60px_-15px_rgba(0,0,0,0.3)] border-b">
      <div className="flex justify-start items-center w-1/5 mr-auto ml-1 h-full text-lg font-bold">
        {title}
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
        <button
          className="border  rounded  bg-blue-500 hover:bg-blue-700
           px-3 py-1 m-1 text-white"
          onClick={onLogout}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
