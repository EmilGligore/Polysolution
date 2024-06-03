import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHospitalUser,
  faUser,
  faBoxesStacked,
  faBed,
  faFileArrowDown,
  faFileAlt
} from "@fortawesome/free-solid-svg-icons";
import "../index.css";
import Logo from "../assets/LogoW.png";

export default function SideBar({ setActiveComponent, onLogout }) {
  const [activeItem, setActiveItem] = useState(null);

  const handleItemClick = (component) => {
    setActiveComponent(component);
    setActiveItem(component);
  };

  return (
    <div className="w-[15%] flex flex-col items-center align-middle bg-inherit shadow-[inset_-2px_0px_3px_-1px_rgba(23,37,84,0.5)]">
      <div className="m-1">
        <img src={Logo} alt="Logo" className="ml-[1px] h-[110%]" />
      </div>
      <ul className="w-full">
        <div
          className={`m-1 ${
            activeItem === "userDetails" ? "bg-blue-900" : "hover:bg-blue-900"
          } rounded`}
          onClick={() => handleItemClick("userDetails")}
        >
          <li title="User Details" className="flex items-center py-2">
            <FontAwesomeIcon
              icon={faUser}
              style={{ color: "#ffffff" }}
              size="lg"
              className="mr-2"
            />
            <span
              className={`text-white ${
                activeItem === "userDetails" ? "font-bold" : ""
              } ml-3`}
            >
              Clients
            </span>
          </li>
        </div>
        <div
          className={`m-1 ${
            activeItem === "schedule" ? "bg-blue-900" : "hover:bg-blue-900"
          } rounded`}
          onClick={() => handleItemClick("schedule")}
        >
          <li title="Schedule" className="flex items-center py-2">
            <FontAwesomeIcon
              icon={faHospitalUser}
              style={{ color: "#ffffff" }}
              size="lg"
              className="mr-2"
            />
            <span
              className={`text-white ${
                activeItem === "schedule" ? "font-bold" : ""
              } ml-2`}
            >
              Appointments
            </span>
          </li>
        </div>
        <div
          className={`m-1 ${
            activeItem === "stock" ? "bg-blue-900" : "hover:bg-blue-900"
          } rounded`}
          onClick={() => handleItemClick("stock")}
        >
          <li title="Stock" className="flex items-center py-2">
            <FontAwesomeIcon
              icon={faBoxesStacked}
              style={{ color: "#ffffff" }}
              size="lg"
              className="mr-2"
            />
            <span
              className={`text-white ${
                activeItem === "stock" ? "font-bold" : ""
              } ml-2`}
            >
              Stock
            </span>
          </li>
        </div>
        <div
          className={`m-1 ${
            activeItem === "beds" ? "bg-blue-900" : "hover:bg-blue-900"
          } rounded`}
          onClick={() => handleItemClick("beds")}
        >
          <li title="Beds" className="flex items-center py-2">
            <FontAwesomeIcon
              icon={faBed}
              style={{ color: "#ffffff" }}
              size="lg"
              className="mr-2"
            />
            <span
              className={`text-white ${
                activeItem === "beds" ? "font-bold" : ""
              } ml-2`}
            >
              Beds
            </span>
          </li>
        </div>
        <div
          className={`m-1 ${
            activeItem === "docexport" ? "bg-blue-900" : "hover:bg-blue-900"
          } rounded`}
          onClick={() => handleItemClick("docexport")}
        >
          <li title="docexport" className="flex items-center py-2">
            <FontAwesomeIcon
              icon={faFileArrowDown}
              style={{ color: "#ffffff" }}
              size="lg"
              className="mr-2"
            />
            <span
              className={`text-white ${
                activeItem === "docexport" ? "font-bold" : ""
              } ml-4`}
            >
              Documents
            </span>
          </li>
        </div>
        <div
          className={`m-1 ${
            activeItem === "reports" ? "bg-blue-900" : "hover:bg-blue-900"
          } rounded`}
          onClick={() => handleItemClick("reports")}
        >
          <li title="reports" className="flex items-center py-2">
            <FontAwesomeIcon
              icon={faFileAlt}
              style={{ color: "#ffffff" }}
              size="lg"
              className="mr-2"
            />
            <span
              className={`text-white ${
                activeItem === "reports" ? "font-bold" : ""
              } ml-2`}
            >
              Reports
            </span>
          </li>
        </div>
      </ul>
    </div>
  );
}
