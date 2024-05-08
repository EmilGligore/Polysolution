import "../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHospitalUser } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function SideBar() {
  return (
    <div className=" w-14 flex flex-col justify-start align-middle bg-blue-800">
      <ul>
        <FontAwesomeIcon
          icon={faHospitalUser}
          style={{ color: "#c6d0e1" }}
          className="border-r-2 border-transparent pl-5 pr-4 mt-1 py-2 hover:border-white"
        />
      </ul>
    </div>
  );
}
