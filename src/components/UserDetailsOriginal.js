import { faSave } from "@fortawesome/free-solid-svg-icons";
import "../index.css";
import React, { useState, useMemo } from "react";
import { db } from "../config/firebase";
import {
  getDocs,
  getDoc,
  collection,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

export default function UserDetails() {
  const [clientsList, setClientsList] = React.useState([]);
  const [isAddingClient, setIsAddingClient] = useState(false);

  const clientsCollectionRef = useMemo(() => collection(db, "clients"), []);
  function timestampToDate(input) {
    if (typeof input === "string") {
      return input;
    } else if (input && typeof input.toDate === "function") {
      const date = input.toDate();
      if (isNaN(date.getTime())) {
        return "";
      }
      const year = date.getFullYear();
      const month = `0${date.getMonth() + 1}`.slice(-2);
      const day = `0${date.getDate()}`.slice(-2);
      return `${year}-${month}-${day}`;
    } else {
      console.error(
        "Invalid input: not a Firestore Timestamp object or a string in YYYY-MM-DD format."
      );
      return "";
    }
  }

  React.useEffect(() => {
    const getClientsList = async () => {
      try {
        const data = await getDocs(clientsCollectionRef);
        const filteredData = data.docs.map((doc) => {
          return {
            ...doc.data(),
            id: doc.id,
            birthdate: doc.data().birthdate
              ? timestampToDate(doc.data().birthdate)
              : "",
          };
        });
        setClientsList(filteredData);
      } catch (err) {
        console.error(err);
      }
    };
    getClientsList();
  }, [clientsList]);

  const [showNewInfo, setShowNewInfo] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  const handleAddNewClient = async () => {
    const isFormComplete = Object.values(formData).every(
      (value) => value !== "" || typeof value === "boolean"
    );
    if (!isFormComplete) {
      alert("Please fill out all fields before saving.");
      return;
    }

    try {
      await addDoc(clientsCollectionRef, {
        ...formData,
        birthdate: new Date(formData.birthdate),
      });
      alert("Client added successfully!");
      resetFormData();
      setShowNewInfo(false);
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Failed to add new client.");
    }
    setIsAddingClient(false);
  };

  const changeOption = (index) => {
    setSelectedOptionIndex(index);
    setIsAddingClient(false);
    setSelectedOptionIndex(index);
    if (index > 0) {
      const selectedClient = clientsList[index - 1];
      setFormData({
        firstName: selectedClient.firstName || "",
        surname: selectedClient.surname || "",
        ssn: selectedClient.ssn || "",
        phone: selectedClient.phone || "",
        email: selectedClient.email || "",
        birthdate: selectedClient.birthdate || "",
        gender: selectedClient.gender || "",
        healthproblems: selectedClient.healthproblems || "",
        emerphone: selectedClient.emerphone || "",
        emername: selectedClient.emername || "",
        gdpr: selectedClient.gdpr || false,
      });
      if (index >= 0) {
        setShowNewInfo(false);
      }
    } else {
      setFormData(initialFormData);
      setShowNewInfo(true);
    }
  };

  const initialFormData = {
    firstName: "",
    surname: "",
    ssn: "",
    phone: "",
    email: "",
    birthdate: "",
    gender: "",
    healthproblems: "",
    emerphone: "",
    emername: "",
    gdpr: false,
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const [formData, setFormData] = useState(initialFormData);

  function addNewClient() {
    setShowNewInfo((prevShowNewInfo) => !prevShowNewInfo);
  }

  const handleEdit = async () => {
    if (showNewInfo) {
      const clientDocRef = doc(
        db,
        "clients",
        clientsList[selectedOptionIndex - 1].id
      );
      try {
        await updateDoc(clientDocRef, formData);
      } catch (err) {
        console.error("Error updating document: ", err);
        alert("Failed to update client information.");
      }
    }
    setShowNewInfo(!showNewInfo);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div>
      <h1 className="ml-1 font-bold border-b border-gray-200 h-12 flex items-center justify-start">
        Client Information
      </h1>
      <div className="flex h-12 border-b border-gray-200 items-center justify-normal">
        <div className="mx-auto">
          <select
            value={selectedOptionIndex}
            onChange={(e) => changeOption(parseInt(e.target.value))}
          >
            <option value="0">Select Existing Client</option>
            {clientsList.map((client, index) => (
              <option key={client.id} value={index + 1}>
                {client.firstName} {client.surname}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            if (selectedOptionIndex === 0) {
              handleAddNewClient();
            } else {
              handleEdit();
            }
          }}
          className="bg-blue-500 hover:bg-blue-700 py-1 px-4 m-1 rounded text-white"
          style={{ width: "70px" }}
        >
          {selectedOptionIndex > 0 && !showNewInfo ? "Edit" : "Save"}
        </button>

        <button
          onClick={() => {
            setIsAddingClient(true);
            changeOption(0);
          }}
          className="bg-blue-500 hover:bg-blue-700 px-3 py-1 m-1 rounded text-white"
          style={{ width: "70px" }}
        >
          + Add
        </button>
      </div>
      {/* Nu sterg capoate nu merge ce e nou */}
      {/* <div className="flex flex-col">
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>First Name</span>
          <input
            readOnly={!showNewInfo}
            type="text"
            className="border border-solid rounded"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
          ></input>
        </div>
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>Surname</span>
          <input
            readOnly={!showNewInfo}
            type="text"
            className="border border-solid rounded"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
          ></input>
        </div>
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>Social Security Number</span>
          <input
            readOnly={!showNewInfo}
            className="border border-solid rounded"
            name="ssn"
            value={formData.ssn}
            onChange={handleInputChange}
          ></input>
        </div>
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>Phone</span>
          <input
            readOnly={!showNewInfo}
            type="tel"
            className="border border-solid rounded"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          ></input>
        </div>
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>Email</span>
          <input
            readOnly={!showNewInfo}
            type="email"
            className="border border-solid rounded"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          ></input>
        </div>
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>Birthdate</span>
          <input
            readOnly={!showNewInfo}
            type="date"
            className="border border-solid rounded"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleInputChange}
          ></input>
        </div>
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>Gender</span>
          <select
            disabled={!showNewInfo}
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="border border-solid rounded"
          >
            <option>{""}</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>Existing Health Problems</span>
          <input
            readOnly={!showNewInfo}
            type="text"
            className="border border-solid rounded"
            name="healthproblems"
            value={formData.healthproblems}
            onChange={handleInputChange}
          ></input>
        </div>
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>Emergency Contact Phone</span>
          <input
            readOnly={!showNewInfo}
            type="tel"
            className="border border-solid rounded"
            name="emerphone"
            value={formData.emerphone}
            onChange={handleInputChange}
          ></input>
        </div>
        <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
          <span>Emergency Contact Name</span>
          <input
            readOnly={!showNewInfo}
            className="border border-solid rounded"
            name="emername"
            value={formData.emername}
            onChange={handleInputChange}
          ></input>
        </div>
      </div> */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">First Name</span>
          <input
            type="text"
            name="firstName"
            readOnly={!showNewInfo}
            value={formData.firstName}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          />
        </div>
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">Surname</span>
          <input
            type="text"
            name="surname"
            readOnly={!showNewInfo}
            value={formData.surname}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          />
        </div>
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">Social Security Number</span>
          <input
            type="text"
            name="ssn"
            readOnly={!showNewInfo}
            value={formData.ssn}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          />
        </div>
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">Phone</span>
          <input
            type="tel"
            name="phone"
            readOnly={!showNewInfo}
            value={formData.phone}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          />
        </div>
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">Email</span>
          <input
            type="email"
            name="email"
            readOnly={!showNewInfo}
            value={formData.email}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          />
        </div>
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">Birthdate</span>
          <input
            type="date"
            name="birthdate"
            readOnly={!showNewInfo}
            value={formData.birthdate}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          />
        </div>
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">Gender</span>
          <select
            name="gender"
            disabled={!showNewInfo}
            value={formData.gender}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          >
            <option value=""></option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">Existing Health Problems</span>
          <input
            type="text"
            name="healthproblems"
            readOnly={!showNewInfo}
            value={formData.healthproblems}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          />
        </div>
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">Emergency Contact Phone</span>
          <input
            type="tel"
            name="emerphone"
            readOnly={!showNewInfo}
            value={formData.emerphone}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          />
        </div>
        <div className="flex items-center space-x-4 border-b border-gray-200 h-12 justify-start ml-1">
          <span className="w-1/3 text-left">Emergency Contact Name</span>
          <input
            type="text"
            name="emername"
            readOnly={!showNewInfo}
            value={formData.emername}
            onChange={handleInputChange}
            className="flex-grow border rounded"
          />
        </div>
      </div>
      <div className="border-b border-gray-200 h-12 flex items-center justify-start ml-1">
        <span>I accept EU GDPR</span>
        <input
          type="checkbox"
          name="gdpr"
          checked={formData.gdpr}
          onChange={handleInputChange}
          readOnly={!showNewInfo}
          className="border border-solid rounded"
        ></input>
      </div>
    </div>
  );
}
