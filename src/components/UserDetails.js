import { faSave } from "@fortawesome/free-solid-svg-icons";
import "../index.css";
import React, { useState } from "react";
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

  const clientsCollectionRef = collection(db, "clients");

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
    <div className="mt-1">
      <h1 className="ml-10">Client Information</h1>
      <b>Select Existing Client</b>
      <div>
        <select
          value={selectedOptionIndex}
          onChange={(e) => changeOption(parseInt(e.target.value))}
        >
          <option value="0">Select</option>
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
      >
        {selectedOptionIndex > 0 && !showNewInfo ? "Edit" : "Save"} Client
      </button>

      <b>Add New Client</b>
      <button
        onClick={() => {
          setIsAddingClient(true);
          changeOption(0);
        }}
        className="h-5"
      >
        +
      </button>
      <div className="flex flex-col">
        <span>First Name</span>
        <input
          readOnly={!showNewInfo}
          type="text"
          className="border-black border border-solid"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
        ></input>
        <span>Surname</span>
        <input
          readOnly={!showNewInfo}
          type="text"
          className="border-black border border-solid"
          name="surname"
          value={formData.surname}
          onChange={handleInputChange}
        ></input>
        <span>Social Security Number</span>
        <input
          readOnly={!showNewInfo}
          className="border-black border border-solid"
          name="ssn"
          value={formData.ssn}
          onChange={handleInputChange}
        ></input>
        <span>Phone</span>
        <input
          readOnly={!showNewInfo}
          type="tel"
          className="border-black border border-solid"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        ></input>
        <span>Email</span>
        <input
          readOnly={!showNewInfo}
          type="email"
          className="border-black border border-solid"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        ></input>
        <span>Birthdate</span>
        <input
          readOnly={!showNewInfo}
          type="date"
          className="border-black border border-solid"
          name="birthdate"
          value={formData.birthdate}
          onChange={handleInputChange}
        ></input>
        <span>Gender</span>
        <select
          disabled={!showNewInfo}
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
        >
          <option>{""}</option>
          <option>Male</option>
          <option>Female</option>
        </select>
        <span>Existing Health Problems</span>
        <input
          readOnly={!showNewInfo}
          type="text"
          className="border-black border border-solid"
          name="healthproblems"
          value={formData.healthproblems}
          onChange={handleInputChange}
        ></input>
        <span>Emergency Contact Phone</span>
        <input
          readOnly={!showNewInfo}
          type="tel"
          className="border-black border border-solid"
          name="emerphone"
          value={formData.emerphone}
          onChange={handleInputChange}
        ></input>
        <span>Emergency Contact Name</span>
        <input
          readOnly={!showNewInfo}
          className="border-black border border-solid"
          name="emername"
          value={formData.emername}
          onChange={handleInputChange}
        ></input>
      </div>
      <input
        type="checkbox"
        name="gdpr"
        checked={formData.gdpr}
        onChange={handleInputChange}
        readOnly={!showNewInfo}
      ></input>
      <span>I accept EU GDPR</span>
    </div>
  );
}
