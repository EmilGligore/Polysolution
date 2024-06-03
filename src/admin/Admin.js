// src/admin/Admin.js

import React, { useState } from "react";
import SideBarAdmin from "./SideBarAdmin";
import ScheduleAdmin from "./ScheduleAdmin";
import UserDetailsAdmin from "./UserDetailsAdmin";
import StockAdmin from "./StockAdmin";
import BedsAdmin from "./BedsAdmin";
import DocExportAdmin from "./DocExportAdmin";
import NavBarAdmin from "./NavBarAdmin";

export default function Admin({ onLogout }) {
  const [activeComponent, setActiveComponent] = useState(null);

  const renderComponent = () => {
    switch (activeComponent) {
      case "schedule":
        return <ScheduleAdmin />;
      case "userDetails":
        return <UserDetailsAdmin />;
      case "stock":
        return <StockAdmin />;
      case "beds":
        return <BedsAdmin />;
      case "docexport":
        return <DocExportAdmin />;
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  return (
    <main className="flex h-screen w-full">
      <SideBarAdmin setActiveComponent={setActiveComponent} />
      <div className="flex-grow flex flex-col bg-white">
      <NavBarAdmin onLogout={onLogout} />

        {renderComponent()}
      </div>
    </main>
  );
}
