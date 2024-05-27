import React, { useState } from "react";
import SideBar from "./SideBar";
import UserDetails from "./UserDetails";
import Schedule from "./Schedule";
import Stock from "./Stock";
import Beds from "./Beds";
import DocExport from "./DocExport";

export default function Main() {
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
        return <DocExport />
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  return (
    <main className="flex h-screen w-full ">
      <SideBar setActiveComponent={setActiveComponent} />
      <div className="flex-grow rounded-tl border border-inherit bg-white">
        {renderComponent()}
      </div>
    </main>
  );
}
