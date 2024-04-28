import Logo from "../assets/LogoW.png";
import HamburgerLogo from "../assets/HamburgerIcon.jpeg";
import "../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function NavBar() {
  return (
    <header className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500 flex items-center ">
      <div className="flex justify-start items-center w-1/5 mr-auto ml-3 h-full">
        <a href="#">
          <img
            src={HamburgerLogo}
            alt="HamburgerLogo"
            className="w-48 -ml-1 border-b-2 border-transparent hover:border-white"
          />
        </a>
        <div>
          <a href="#">
            <img src={Logo} alt="Logo" />
          </a>
        </div>
      </div>
      <div className="flex items-center justify-end mr-5">
        <a
          href="#"
          className="py-2 px-2 border-b-2 border-transparent hover:border-white"
        >
          <FontAwesomeIcon icon={faBell} style={{ color: "#ffffff" }} />
        </a>
        <a
          className="ml-5 border-b-2 py-2 px-2 border-transparent hover:border-white"
          href="#"
        >
          <FontAwesomeIcon icon={faUser} style={{ color: "#ffffff" }} />
        </a>
      </div>
    </header>
  );
}
