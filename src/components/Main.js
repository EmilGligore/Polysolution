import React, { useState } from "react";
import SideBar from "./SideBar";
import UserDetails from "./UserDetails";
import Schedule from "./Schedule";
import Stock from "./Stock";
import Auth from "./Auth";
import Beds from "./Beds";

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
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  return (
    <main className="flex h-screen w-full bg-blue-800">
      <SideBar setActiveComponent={setActiveComponent} />
      <div className="flex-grow rounded-tl border border-blue-800 bg-white">
        {renderComponent()}
      </div>
    </main>
  );
}
