import React, { useState } from "react";
import "../index.css";
import { auth } from "../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function RecoverPassword({ onBack }) {
  // State to manage the email input
  const [email, setEmail] = useState("");
  // State to manage the message to be displayed
  const [message, setMessage] = useState("");
  // State to manage the success or failure of the password reset request
  const [isSuccess, setIsSuccess] = useState(true);

  // Function to handle password recovery
  const recoverPassword = async () => {
    if (email) {
      try {
        console.log("Sending password reset email to:", email);
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent!");
        setIsSuccess(true);
        console.log("Password reset email sent successfully.");
      } catch (error) {
        setMessage("Failed to send password reset email.");
        console.error("Error sending password reset email:", error.message);
        setIsSuccess(false);
      }
    } else {
      setMessage("Please enter your email address.");
      setIsSuccess(false);
      console.log("Email address not entered.");
    }
  };

  // Render the component
  return (
    <div className="flex flex-col items-center justify-center bg-BackgroundAuth w-screen h-screen">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96">
        <div className="flex items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800 text-center flex-grow">
            Recover Password
          </h2>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <span
          className={`my-3 text-sm text-center justify-center flex ${
            isSuccess ? "text-green-500" : "text-red-500"
          } ${message ? "" : "invisible"}`}
        >
          {message}
        </span>
        <div className="flex items-center justify-between mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={recoverPassword}
          >
            Send Recovery Email
          </button>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={onBack}
          >
            Back to Log In
          </button>
        </div>
      </div>
    </div>
  );
}
