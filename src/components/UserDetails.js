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
      const clientDocRef = doc(
        db,
        "clients",
        clientsList[selectedOptionIndex - 1].id
      );
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
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : newValue,
    }));
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <select
          value={selectedOptionIndex}
          onChange={(e) => changeOption(parseInt(e.target.value))}
          disabled={showNewInfo}
          className="p-2 border rounded-md"
        >
          <option value="0">Select Existing Client</option>
          {clientsList.map((client, index) => (
            <option key={client.id} value={index + 1}>
              {client.firstName} {client.surname}
            </option>
          ))}
        </select>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className={`${
              !showNewInfo && selectedOptionIndex > 0
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-gray-400"
            } py-1 px-4 rounded text-white`}
            disabled={showNewInfo || selectedOptionIndex === 0}
          >
            Edit
          </button>
          <button
            onClick={handleSave}
            className={`${
              showNewInfo ? "bg-blue-500 hover:bg-green-500" : "bg-gray-400"
            } py-1 px-4 rounded text-white`}
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
            } px-3 py-1 rounded text-white`}
            disabled={showNewInfo}
          >
            + Add
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {[
          { label: "First Name", name: "firstName", type: "text" },
          { label: "Surname", name: "surname", type: "text" },
          { label: "Social Security Number", name: "ssn", type: "text" },
          { label: "Phone", name: "phone", type: "tel" },
          { label: "Email", name: "email", type: "email" },
          { label: "Birthdate", name: "birthdate", type: "date" },
          {
            label: "Gender",
            name: "gender",
            type: "select",
            options: [
              { value: "", label: "Choose Gender..." },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ],
          },
          {
            label: "Existing Health Problems",
            name: "healthproblems",
            type: "text",
          },
          {
            label: "Emergency Contact Phone",
            name: "emerphone",
            type: "tel",
          },
          {
            label: "Emergency Contact Name",
            name: "emername",
            type: "text",
          },
        ].map((field) => (
          <div key={field.name} className="flex items-center space-x-4">
            <span className="w-1/3 text-left">{field.label}</span>
            {field.type === "select" ? (
              <select
                name={field.name}
                disabled={!showNewInfo}
                value={formData[field.name]}
                onChange={handleInputChange}
                className="flex-grow p-2 border rounded"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                readOnly={!showNewInfo}
                value={formData[field.name]}
                onChange={handleInputChange}
                className="flex-grow p-2 border rounded"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
