import React, { useState } from "react";
import SideBar from "./SideBar";
import UserDetails from "./UserDetails";
import Schedule from "./Schedule";
import Stock from "./Stock";
import Beds from "./Beds";
import DocExport from "./DocExport";
import NavBar from "./NavBar";
import Reports from "./Reports";
import EmployeeForm from "./EmployeeForm"

export default function Main({ onLogout }) {
  // State to manage the currently active component
  const [activeComponent, setActiveComponent] = useState(null);

  // Function to render the active component based on the state
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
      case "employeeform":
        return <EmployeeForm />;
      default:
    }
  };

  // Function to get the title of the active component
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
      case "employeeform":
        return "Schedule";
      default:
        return "Select an option from the sidebar";
    }
  };

  // Render the layout with a sidebar, navbar, and the active component
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
