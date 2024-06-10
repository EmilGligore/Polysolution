import React, { useState } from "react";
import EmployeeNavBar from "./EmployeeNavBar";
import EmployeeSchedule from "./EmployeeSchedule";
import SideBarEmployee from "./SideBarEmployee";

// Main component for the Employee view
export default function Employee({ onLogout }) {
  // State to manage the active component
  const [activeComponent, setActiveComponent] = useState("schedule");

  // Function to render the active component based on the state
  const renderComponent = () => {
    switch (activeComponent) {
      case "schedule":
        return <EmployeeSchedule />;
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  // Render the layout with a sidebar, navbar, and the active component
  return (
    <main className="flex h-screen w-full">
      <SideBarEmployee setActiveComponent={setActiveComponent} />
      <div className="flex-grow flex flex-col bg-white">
        <EmployeeNavBar onLogout={onLogout} />
        {renderComponent()}
      </div>
    </main>
  );
}
