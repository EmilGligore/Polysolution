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
    <div className="w-14 flex flex-col items-center align-middle bg-blue-800">
      <ul>
        <li onClick={() => setActiveComponent("schedule")}>
          <FontAwesomeIcon
            icon={faHospitalUser}
            style={{ color: "#ffffff" }}
            size="lg"
            className="border-r-2 border-transparent hover:border-white px-4 py-2"
          />
        </li>
        <li onClick={() => setActiveComponent("userDetails")}>
          <FontAwesomeIcon
            icon={faUser}
            style={{ color: "#ffffff" }}
            size="lg"
            className="border-r-2 border-transparent  hover:border-white px-4 pl-5 pr-[17px] py-2"
          />
        </li>
        <li onClick={() => setActiveComponent("stock")}>
          <FontAwesomeIcon
            icon={faBoxesStacked}
            style={{ color: "#ffffff" }}
            size="lg"
            className="border-r-2 border-transparent  hover:border-white px-4 py-2"
          />
        </li>
        <li onClick={() => setActiveComponent("beds")}>
          <FontAwesomeIcon
            icon={faBed}
            style={{ color: "#ffffff" }}
            size="lg"
            className="border-r-2 border-transparent  hover:border-white px-3.5 pr-[16px] py-2"
          />
        </li>
      </ul>
    </div>
  );
}
