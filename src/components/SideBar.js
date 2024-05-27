import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHospitalUser,
  faUser,
  faBoxesStacked,
  faBed,
  faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import "../index.css";

export default function SideBar({ setActiveComponent }) {
  return (
    <div className="w-14 flex flex-col items-center align-middle bg-inherit shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
      <ul>
        <li
          onClick={() => setActiveComponent("userDetails")}
          title="User Details"
        >
          <FontAwesomeIcon
            icon={faUser}
            style={{ color: "#ffffff" }}
            size="lg"
            className="border-r-2 border-transparent hover:border-white px-4 pl-5 pr-[17px] py-2"
          />
        </li>
        <li onClick={() => setActiveComponent("schedule")} title="Schedule">
          <FontAwesomeIcon
            icon={faHospitalUser}
            style={{ color: "#ffffff" }}
            size="lg"
            className="border-r-2 border-transparent hover:border-white px-4 py-2"
          />
        </li>
        <li onClick={() => setActiveComponent("stock")} title="Stock">
          <FontAwesomeIcon
            icon={faBoxesStacked}
            style={{ color: "#ffffff" }}
            size="lg"
            className="border-r-2 border-transparent hover:border-white px-4 py-2"
          />
        </li>
        <li onClick={() => setActiveComponent("beds")} title="Beds">
          <FontAwesomeIcon
            icon={faBed}
            style={{ color: "#ffffff" }}
            size="lg"
            className="border-r-2 border-transparent hover:border-white px-3.5 pr-[16px] py-2"
          />
        </li>
        <li onClick={() => setActiveComponent("docexport")} title="docexport">
          <FontAwesomeIcon
            icon={faFileArrowDown}
            style={{ color: "#ffffff" }}
            size="lg"
            className="border-r-2 border-transparent hover:border-white px-3.5 pr-[16px] py-2"
          />
        </li>
      </ul>
    </div>
  );
}
