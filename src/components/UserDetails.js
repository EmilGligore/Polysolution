import "../index.css";
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebase";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

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

export default function UserDetails() {
  const [clientsList, setClientsList] = useState([]);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [showNewInfo, setShowNewInfo] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [formData, setFormData] = useState(initialFormData);

  const clientsCollectionRef = useMemo(() => collection(db, "clients"), []);

  useEffect(() => {
    const getClientsList = async () => {
      try {
        const data = await getDocs(clientsCollectionRef);
        const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          birthdate: doc.data().birthdate
            ? timestampToDate(doc.data().birthdate)
            : "",
        }));
        setClientsList(filteredData);
        if (filteredData.length > 0) {
          setShowNewInfo(false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    getClientsList();
  }, [clientsCollectionRef]);

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

  const handleSave = async () => {
    if (selectedOptionIndex > 0) {
      const clientDocRef = doc(db, "clients", clientsList[selectedOptionIndex - 1].id);
      try {
        if (!isFormValid()) {
          alert("Please fill out all fields correctly before saving.");
          return;
        }
        await updateDoc(clientDocRef, formData);
        alert("Client updated successfully!");
        setShowNewInfo(false);
        refreshClientsList();
      } catch (err) {
        console.error("Error updating document: ", err);
        alert("Failed to update client information.");
      }
    } else {
      handleAddNewClient();
    }
  };

  const refreshClientsList = async () => {
    const data = await getDocs(clientsCollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      birthdate: doc.data().birthdate
        ? timestampToDate(doc.data().birthdate)
        : "",
    }));
    setClientsList(filteredData);
  };

  const isFormValid = () => {
    const namePattern = /^[A-Za-z]{1,12}$/;
    const ssnPattern = /^\d{1,15}$/;
    const phonePattern = /^\d{1,15}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const healthPattern = /^[A-Za-z0-9\s]{1,50}$/;
    const emerNamePattern = /^[A-Za-z\s]{1,30}$/;
  
    return (
      namePattern.test(formData.firstName) &&
      namePattern.test(formData.surname) &&
      ssnPattern.test(formData.ssn) &&
      phonePattern.test(formData.phone) &&
      emailPattern.test(formData.email) &&
      formData.birthdate && // Ensure birthdate is not empty
      (formData.gender === "Male" || formData.gender === "Female") &&
      healthPattern.test(formData.healthproblems) &&
      phonePattern.test(formData.emerphone) &&
      emerNamePattern.test(formData.emername)
    );
  };

  const handleAddNewClient = async () => {
    if (!isFormValid()) {
      alert("Please fill out all fields correctly before saving.");
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
      refreshClientsList();
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Failed to add new client.");
    }
    setIsAddingClient(false);
  };

  const changeOption = (index) => {
    setSelectedOptionIndex(index);
    setIsAddingClient(false);
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
      setShowNewInfo(false);
    } else {
      resetFormData();
      setShowNewInfo(false);
    }
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const handleEdit = () => {
    setShowNewInfo(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (name === "firstName" || name === "surname" || name === "emername") {
      newValue = newValue
        .replace(/[^A-Za-z\s]/g, "")
        .slice(0, name === "emername" ? 30 : 12);
    } else if (name === "ssn" || name === "phone" || name === "emerphone") {
      newValue = newValue.replace(/[^0-9]/g, "").slice(0, 15);
    } else if (name === "healthproblems") {
      newValue = newValue.replace(/[^A-Za-z0-9\s]/g, "").slice(0, 50);
    } else if (name === "birthdate") {
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : newValue,
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
            disabled={showNewInfo}
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
          onClick={handleEdit}
          className={`${
            !showNewInfo && selectedOptionIndex > 0
              ? "bg-blue-500 hover:bg-blue-700"
              : "bg-gray-400"
          } py-1 px-4 m-1 rounded text-white`}
          style={{ width: "70px" }}
          disabled={showNewInfo || selectedOptionIndex === 0}
        >
          Edit
        </button>
        <button
          onClick={handleSave}
          className={`${
            showNewInfo ? "bg-blue-500 hover:bg-green-500" : "bg-gray-400"
          } py-1 px-4 m-1 rounded text-white`}
          style={{ width: "70px" }}
          disabled={!showNewInfo || !isFormValid()}
        >
          Save
        </button>

        <button
          onClick={() => {
            resetFormData();
            setShowNewInfo(true);
            setSelectedOptionIndex(0);
          }}
          className={`${
            showNewInfo ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
          } px-3 py-1 m-1 rounded text-white`}
          style={{ width: "70px" }}
          disabled={showNewInfo}
        >
          + Add
        </button>
      </div>
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
            placeholder="Choose Gender..."
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
    </div>
  );
}
