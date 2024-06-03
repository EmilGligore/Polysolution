import React, { useState } from "react";
import SideBar from "./SideBar";
import UserDetails from "./UserDetails";
import Schedule from "./Schedule";
import Stock from "./Stock";
import Beds from "./Beds";
import DocExport from "./DocExport";
import NavBar from "./NavBar";
import Reports from "./Reports";

export default function Main({ onLogout }) {
  const [activeComponent, setActiveComponent] = useState(null);

  const renderComponent = () => {
    switch (activeComponent) {
      case "schedule":
        return <Schedule />;
      case "userDetails":
        return <UserDetails />;
      case "stock":
        return <Stock />;
      case "beds":
        return <Beds />;
      case "docexport":
        return <DocExport />;
      case "reports":
        return <Reports />;
      default:
    }
  };

  const getComponentTitle = () => {
    switch (activeComponent) {
      case "schedule":
        return "Schedule";
      case "userDetails":
        return "Client Information";
      case "stock":
        return "Stock";
      case "beds":
        return "Beds Availability";
      case "docexport":
        return "Export Document";
      case "reports":
        return "Reports";
      default:
        return "Select an option from the sidebar";
    }
  };

  return (
    <main className="flex h-screen w-full overflow-hidden">
      <SideBar setActiveComponent={setActiveComponent} />
      <div className="flex-grow flex flex-col bg-white">
        <NavBar onLogout={onLogout} title={getComponentTitle()} />
        <div className="flex-grow overflow-hidden">{renderComponent()}</div>
      </div>
    </main>
  );
}
