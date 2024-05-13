import React, { useState } from "react";
import "../index.css";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const logIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-BackgroundAuth w-screen h-screen">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
          Welcome
        </h2>
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
        <div className="mb-2 relative">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <FontAwesomeIcon
            icon={faEye}
            size="sm"
            style={{
              position: "absolute",
              right: "10px",
              top: "40px",
              color: "#374151",
              cursor: "pointer",
            }}
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        <div
          className={`text-red-500 text-sm mb-3 text-center items-center justify-center flex ${
            error ? "" : "invisible"
          }`}
        >
          Email or password are incorrect!
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={logIn}
          >
            Log In
          </button>
        </div>
        <div className="text-right my-3 border-b-2 pb-3">
          <a href="#" className="text-blue-500 text-sm hover:text-blue-800">
            Forgot password?
          </a>
        </div>
        <p className="text-black text-xl text-center -mb-1">
          Want to sign up?
          <br />
          Contact us at:
          <br />
          <a
            href="mailto:sales@polysolution.com?subject=I%20want%20to%20sign%20up&body=Hello%20Polysolution!%0D%0A%0D%0AWe%20want%20to%20sign%20up%20with%20your%20service.%20Could%20you%20give%20us%20more%20details%3F%0D%0A%0D%0AThank%20you!"
            className="underline text-blue-500 hover:text-blue-800"
          >
            sales@polysolution.com
          </a>
        </p>
      </div>
    </div>
  );
}
