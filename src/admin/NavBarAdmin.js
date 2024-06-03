// src/admin/NavBarAdmin.js

import React from "react";

export default function NavBarAdmin({ onLogout }) {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex justify-between items-center">
        <div className="text-white text-xl">Admin Panel</div>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
