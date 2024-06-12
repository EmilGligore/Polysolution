import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import "../index.css";
import Logo from "../assets/LogoW.png";

export default function SideBarEmployee({ setActiveComponent }) {
  const [activeItem, setActiveItem] = useState("schedule");

  const handleItemClick = (component) => {
    setActiveComponent(component);
    setActiveItem(component);
  };

  return (
    <div className="w-[15%] flex flex-col items-center align-middle bg-inherit shadow-[inset_-2px_0px_3px_-1px_rgba(23,37,84,0.5)]">
      <div className="m-1">
        <img src={Logo} alt="Logo" className="ml-[1px]" />
      </div>
      <ul className="w-full">
        <div
          className={`m-1 ${
            activeItem === "schedule" ? "bg-blue-900" : "hover:bg-blue-900"
          } rounded`}
          onClick={() => handleItemClick("schedule")}
        >
          <li title="Schedule" className="flex items-center py-2">
            <FontAwesomeIcon
              icon={faCalendarDays}
              style={{ color: "#ffffff" }}
              size="lg"
              className="mr-2"
            />
            <span
              className={`text-white ${
                activeItem === "schedule" ? "font-bold" : ""
              } ml-2`}
            >
              Schedule
            </span>
          </li>
        </div>
        <div
          className={`m-1 ${
            activeItem === "employeeDay" ? "bg-blue-900" : "hover:bg-blue-900"
          } rounded`}
          onClick={() => handleItemClick("employeeDay")}
        >
          <li title="EmployeeDay" className="flex items-center py-2">
            <FontAwesomeIcon
              icon={faCalendarDays}
              style={{ color: "#ffffff" }}
              size="lg"
              className="mr-2"
            />
            <span
              className={`text-white ${
                activeItem === "employeeDay" ? "font-bold" : ""
              } ml-2`}
            >
              Appointments
            </span>
          </li>
        </div>
      </ul>
    </div>
  );
}
