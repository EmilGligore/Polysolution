import React from "react";

export default function EmployeeNavBar({ onLogout }) {
  return (
    <nav className="bg-white p-4 border-b">
      <div className="flex justify-between items-center">
        <div className="text-xl">Employee Panel</div>
        <button
          onClick={onLogout}
          className="border  rounded  bg-blue-500 hover:bg-blue-700
           px-3 py-1 m-1 text-white"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
