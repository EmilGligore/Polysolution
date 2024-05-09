import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHospitalUser,
  faCalendarDays,
  faUser,
  faBoxesStacked,
  faBed,
} from "@fortawesome/free-solid-svg-icons";

export default function SideBar({ setActiveComponent }) {
  return (
    <div className="w-14 flex flex-col justify-start align-middle bg-blue-800">
      <ul>
        <li onClick={() => setActiveComponent("schedule")}>
          <FontAwesomeIcon
            icon={faHospitalUser}
            style={{ color: "#ffffff" }}
            className="border-r-2 border-transparent pl-5 pr-4 mt-1 py-2 hover:border-white"
          />
        </li>
        <li onClick={() => setActiveComponent("userDetails")}>
          <FontAwesomeIcon
            icon={faUser}
            style={{ color: "#ffffff" }}
            className="border-r-2 border-transparent pl-5 pr-4 mt-1 py-2 hover:border-white"
          />
        </li>
        <li onClick={() => setActiveComponent("stock")}>
          <FontAwesomeIcon
            icon={faBoxesStacked}
            style={{ color: "#ffffff" }}
            className="border-r-2 border-transparent pl-5 pr-4 mt-1 py-2 hover:border-white"
          />
        </li>
        <li onClick={() => setActiveComponent("beds")}>
          <FontAwesomeIcon
            icon={faBed}
            style={{ color: "#ffffff" }}
            className="border-r-2 border-transparent pl-5 pr-4 mt-1 py-2 hover:border-white"
          />
        </li>
      </ul>
    </div>
  );
}
