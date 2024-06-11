import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
import {
  deleteDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

export default function Schedule() {
  // State to manage cabinets data
  const [cabinets, setCabinets] = useState([]);
  // State to manage clients data
  const [clients, setClients] = useState([]);
  // State to manage employees data
  const [employees, setEmployees] = useState([]);
  // State to manage the selected date
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  });
  // State to manage the hovered document ID
  const [hoveredDocId, setHoveredDocId] = useState(null);

  // Memoize the references to the 'cabinets' collections to avoid unnecessary re-renders
  const cabinetCollections = useMemo(() => {
    return ["Cabinet 1", "Cabinet 2", "Cabinet 3"].map((cabinetName) => ({
      name: cabinetName,
      collectionRef: collection(db, "cabinets", "cabinets", cabinetName),
    }));
  }, []);

  // Memoize the reference to the 'clients' collection to avoid unnecessary re-renders
  const clientsCollectionRef = useMemo(() => collection(db, "clients"), []);
  const employeesCollectionRef = useMemo(() => collection(db, "employees"), []);

  // Fetch cabinets, clients, and employees data from Firestore when the component mounts
  useEffect(() => {
    const fetchCabinetContents = async () => {
      const fetchedCabinets = await Promise.all(
        cabinetCollections.map(async ({ name, collectionRef }) => {
          try {
            const data = await getDocs(collectionRef);
            const documents = data.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
              isEditable: false,
              clientId: doc.data().clientId,
            }));
            return { name, documents };
          } catch (err) {
            console.error(err);
            return { name, documents: [] };
          }
        })
      );

      setCabinets(fetchedCabinets);
    };

    const fetchClients = async () => {
      try {
        const data = await getDocs(clientsCollectionRef);
        const clientsArray = data.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().surname}`,
        }));
        setClients(clientsArray);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchEmployees = async () => {
      try {
        const data = await getDocs(employeesCollectionRef);
        const employeesArray = data.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().lastName}`,
        }));
        setEmployees(employeesArray);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCabinetContents();
    fetchClients();
    fetchEmployees();
  }, [cabinetCollections, clientsCollectionRef, employeesCollectionRef]);

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle saving a document
  const handleSave = async (cabinetName, docId) => {
    const cabinet = cabinets.find((cabinet) => cabinet.name === cabinetName);
    const docToUpdate = cabinet.documents.find((doc) => doc.id === docId);

    const docRef = doc(db, "cabinets", "cabinets", cabinetName, docId);

    const updateObject = {
      name: docToUpdate.name,
      startTime: docToUpdate.startTime,
      endTime: docToUpdate.endTime,
      procedure: docToUpdate.procedure,
      doctor: docToUpdate.doctor,
      date: selectedDate,
    };

    if (docToUpdate.isNew) {
      try {
        await setDoc(docRef, updateObject);
        console.log("Document successfully added!");
        markDocumentAsNotNew(cabinetName, docId);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      try {
        await updateDoc(docRef, updateObject);
        console.log("Document successfully updated!");
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }

    setCabinets((cabinets) =>
      cabinets.map((cabinet) => {
        if (cabinet.name === cabinetName) {
          return {
            ...cabinet,
            documents: cabinet.documents.map((doc) => {
              if (doc.id === docId) {
                return {
                  ...doc,
                  isEditable: false,
                  isEditing: false,
                  isEdited: false,
                };
              }
              return doc;
            }),
          };
        }
        return cabinet;
      })
    );
  };

  // Handle edit button click
  const handleEditButton = (cabinetName, docId) => {
    setCabinets((cabinets) =>
      cabinets.map((cabinet) => {
        if (cabinet.name === cabinetName) {
          return {
            ...cabinet,
            documents: cabinet.documents.map((doc) => {
              if (doc.id === docId) {
                return {
                  ...doc,
                  isEditable: true,
                  isEditing: true,
                  isEdited: true,
                };
              }
              return doc;
            }),
          };
        }
        return cabinet;
      })
    );
  };

  // Handle input change
  const handleInputChange = (cabinetName, docId, newValue, field) => {
    const lettersOnly = /^[A-Za-z\s]*$/;
    if (
      (field === "procedure" || field === "doctor") &&
      !lettersOnly.test(newValue)
    ) {
      alert("Only letters are allowed for Procedure and Doctor fields.");
      return;
    }

    setCabinets((cabinets) =>
      cabinets.map((cabinet) => {
        if (cabinet.name === cabinetName) {
          return {
            ...cabinet,
            documents: cabinet.documents.map((doc) => {
              if (doc.id === docId) {
                if (
                  field === "startTime" &&
                  doc.endTime &&
                  newValue > doc.endTime
                ) {
                  alert("Start time cannot be after end time.");
                  return doc;
                }
                if (
                  field === "endTime" &&
                  doc.startTime &&
                  newValue < doc.startTime
                ) {
                  alert("End time cannot be before start time.");
                  return doc;
                }
                if (field === "name") {
                  const client = clients.find((c) => c.name === newValue);
                  return {
                    ...doc,
                    [field]: newValue,
                    clientId: client ? client.id : "",
                  };
                }
                return { ...doc, [field]: newValue };
              }
              return doc;
            }),
          };
        }
        return cabinet;
      })
    );
  };

  // Mark document as not new
  const markDocumentAsNotNew = (cabinetName, docId) => {
    setCabinets((cabinets) =>
      cabinets.map((cabinet) => {
        if (cabinet.name === cabinetName) {
          return {
            ...cabinet,
            documents: cabinet.documents.map((doc) => {
              if (doc.id === docId) {
                return { ...doc, isNew: false };
              }
              return doc;
            }),
          };
        }
        return cabinet;
      })
    );
  };

  // Generate unique ID for new documents
  const generateUniqueId = () =>
    `id-${Math.random().toString(36).substr(2, 9)}`;

  // Add new document to cabinet
  const addNewDocumentToCabinet = (cabinetName) => {
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    const maxFutureDate = new Date(today);
    maxFutureDate.setDate(today.getDate() + 30);

    today.setHours(0, 0, 0, 0);

    if (selectedDateObj < today || selectedDateObj > maxFutureDate) {
      alert("Appointments can only be scheduled within 30 days from today.");
      return;
    }

    setCabinets((cabinets) => {
      return cabinets.map((cabinet) => {
        if (cabinet.name === cabinetName) {
          const newDocument = {
            id: generateUniqueId(),
            startTime: "",
            endTime: "",
            name: "",
            procedure: "",
            doctor: "",
            isEditable: true,
            isNew: true,
            isEditing: true,
            date: selectedDate,
          };
          return { ...cabinet, documents: [...cabinet.documents, newDocument] };
        }
        return cabinet;
      });
    });
  };

  // Handle deleting a document
  const handleDelete = async (cabinetName, docId) => {
    const docRef = doc(db, "cabinets", "cabinets", cabinetName, docId);
    try {
      await deleteDoc(docRef);
      console.log("Document successfully deleted!");
      setCabinets((cabinets) =>
        cabinets.map((cabinet) => {
          if (cabinet.name === cabinetName) {
            return {
              ...cabinet,
              documents: cabinet.documents.filter((doc) => doc.id !== docId),
            };
          }
          return cabinet;
        })
      );
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // Check if a form is filled
  const isFormFilled = (doc) => {
    return (
      doc.startTime && doc.endTime && doc.name && doc.procedure && doc.doctor
    );
  };

  // Check if the selected date is before today
  const isBeforeToday =
    new Date(selectedDate) < new Date().setHours(0, 0, 0, 0);
  // Check if the selected date is after 30 days from today
  const isAfter30DaysFromToday =
    new Date(selectedDate) > new Date().setDate(new Date().getDate() + 30);

  // Handle previous date navigation
  const handlePrevDate = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate.toISOString().split("T")[0]);
  };

  // Handle next date navigation
  const handleNextDate = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate.toISOString().split("T")[0]);
  };

  // Check for overlapping appointments
  const hasOverlap = (startTime1, endTime1, startTime2, endTime2) => {
    return (
      (startTime1 < endTime2 && startTime2 < endTime1) ||
      (startTime2 < endTime1 && startTime1 < endTime2)
    );
  };

  // Validate appointment times
  const validateAppointment = (
    cabinetName,
    docId,
    newStartTime,
    newEndTime
  ) => {
    const cabinet = cabinets.find((cabinet) => cabinet.name === cabinetName);
    const overlappingAppointment = cabinet.documents.some((doc) => {
      if (doc.id !== docId && doc.date === selectedDate) {
        return hasOverlap(doc.startTime, doc.endTime, newStartTime, newEndTime);
      }
      return false;
    });
    return !overlappingAppointment;
  };

  // Handle input change with validation
  const handleInputChangeWithValidation = (
    cabinetName,
    docId,
    newValue,
    field
  ) => {
    const cabinet = cabinets.find((cabinet) => cabinet.name === cabinetName);
    const doc = cabinet.documents.find((doc) => doc.id === docId);
    const newStartTime = field === "startTime" ? newValue : doc.startTime;
    const newEndTime = field === "endTime" ? newValue : doc.endTime;

    if (!validateAppointment(cabinetName, docId, newStartTime, newEndTime)) {
      alert("Appointment times overlap. Please choose a different time.");
      return;
    }

    handleInputChange(cabinetName, docId, newValue, field);
  };

  return (
    <div className="flex-grow overflow-auto h-full relative">
      {/* CSS styles for hover buttons */}
      <style>
        {`
          .hover-buttons {
            position: absolute;
            right: 10px;
            display: flex;
          }
        `}
      </style>
      <div className="flex items-center justify-center border-b border-gray-200 h-12">
        <button onClick={handlePrevDate} className="mx-2 hover:bg-gray-300 rounded-full p-1">
          {"<"}
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border rounded p-2"
        ></input>
        <button onClick={handleNextDate} className="mx-2 hover:bg-gray-300 rounded-full p-1">
          {">"}
        </button>
      </div>
      {cabinets.map((cabinet) => (
        <div key={cabinet.name} className="bg-white rounded shadow-md my-4 relative">
          <div className="flex items-center justify-between h-12 border-b border-gray-200 px-4">
            <h2 className="text-lg font-bold">{cabinet.name}</h2>
            <button
              onClick={() => addNewDocumentToCabinet(cabinet.name)}
              className={`${
                isBeforeToday || isAfter30DaysFromToday
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-700"
              } rounded px-4 py-2 text-white`}
              disabled={isBeforeToday || isAfter30DaysFromToday}
            >
              + Add
            </button>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 h-12">
            <div className="flex-grow flex justify-start items-start">
              <span className="ml-2 font-semibold w-[12%]">Start Time</span>
              <span className="w-[12%] font-semibold">End Time</span>
              <span className="w-1/5 font-semibold">Client</span>
              <span className="w-1/5 font-semibold">Procedure</span>
              <span className="w-1/5 font-semibold">Doctor</span>
            </div>
          </div>
          {cabinet.documents
            .filter((doc) => doc.date?.split("T")[0] === selectedDate)
            .map((doc) => (
              <div
                key={doc.id}
                className="flex justify-between items-center h-12 border-b border-gray-200 px-4 relative"
                onMouseEnter={() => setHoveredDocId(doc.id)}
                onMouseLeave={() => setHoveredDocId(null)}
              >
                <div className="flex items-center space-x-4 w-full">
                  <input
                    id="startTime"
                    type="time"
                    readOnly={!doc.isEditable}
                    value={doc.startTime}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        cabinet.name,
                        doc.id,
                        e.target.value,
                        "startTime"
                      )
                    }
                    className="border rounded p-2"
                  ></input>
                  <input
                    id="endTime"
                    type="time"
                    readOnly={!doc.isEditable}
                    value={doc.endTime}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        cabinet.name,
                        doc.id,
                        e.target.value,
                        "endTime"
                      )
                    }
                    className="border rounded p-2"
                  ></input>
                  <select
                    value={doc.name}
                    disabled={!doc.isEditable}
                    onChange={(e) =>
                      handleInputChange(
                        cabinet.name,
                        doc.id,
                        e.target.value,
                        "name"
                      )
                    }
                    className="border rounded p-2"
                  >
                    <option value="">Select Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <input
                    id="procedure"
                    readOnly={!doc.isEditable}
                    value={doc.procedure}
                    onChange={(e) =>
                      handleInputChange(
                        cabinet.name,
                        doc.id,
                        e.target.value,
                        "procedure"
                      )
                    }
                    className="border rounded p-2"
                  ></input>
                  <select
                    value={doc.doctor}
                    disabled={!doc.isEditable}
                    onChange={(e) =>
                      handleInputChange(
                        cabinet.name,
                        doc.id,
                        e.target.value,
                        "doctor"
                      )
                    }
                    className="border rounded p-2"
                  >
                    <option value="">Select Doctor</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.name}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className={`hover-buttons ${hoveredDocId === doc.id ? "" : "hidden"}`}
                >
                  <>
                    <button
                      onClick={() => handleEditButton(cabinet.name, doc.id)}
                      className={`${
                        isBeforeToday || doc.isNew || doc.isEdited
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-700"
                      } py-1 px-4 rounded text-white`}
                      disabled={isBeforeToday || doc.isNew || doc.isEdited}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSave(cabinet.name, doc.id)}
                      className={`${
                        !isFormFilled(doc) ||
                        isBeforeToday ||
                        isAfter30DaysFromToday ||
                        !doc.isEditing
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-700"
                      } py-1 px-4 rounded text-white`}
                      disabled={
                        !isFormFilled(doc) ||
                        isBeforeToday ||
                        isAfter30DaysFromToday ||
                        !doc.isEditing
                      }
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete(cabinet.name, doc.id)}
                      className={`${
                        isBeforeToday || doc.isNew || doc.isEditing
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-700"
                      } py-1 px-4 rounded text-white`}
                      disabled={isBeforeToday || doc.isNew || doc.isEditing}
                    >
                      Delete
                    </button>
                  </>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
