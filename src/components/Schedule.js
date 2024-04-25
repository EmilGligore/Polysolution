import React, { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

export default function Schedule() {
  const [cabinets, setCabinets] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const cabinetCollections = useMemo(() => {
    return ["Cabinet 1", "Cabinet 2", "Cabinet 3"].map((cabinetName) => ({
      name: cabinetName,
      collectionRef: collection(db, "cabinets/cabinets", cabinetName),
    }));
  }, []);

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

    fetchCabinetContents();
  }, [cabinetCollections]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleInputChange = (cabinetName, docId, newValue, field) => {
    setCabinets((cabinets) =>
      cabinets.map((cabinet) => {
        if (cabinet.name === cabinetName) {
          return {
            ...cabinet,
            documents: cabinet.documents.map((doc) => {
              if (doc.id === docId) {
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

  const handleEdit = async (cabinetName, docId) => {
    const cabinet = cabinets.find((cabinet) => cabinet.name === cabinetName);
    const docToUpdate = cabinet.documents.find((doc) => doc.id === docId);

    const docRef = doc(db, "cabinets", "cabinets", cabinetName, docId);

    // Include selectedDate in the updateObject
    const updateObject = {
      name: docToUpdate.name,
      startTime: docToUpdate.startTime,
      endTime: docToUpdate.endTime,
      procedure: docToUpdate.procedure,
      doctor: docToUpdate.doctor,
      date: selectedDate, // Add the selectedDate here
    };

    if (docToUpdate.isEditable) {
      if (docToUpdate.isNew) {
        try {
          await setDoc(docRef, updateObject); // This will now include selectedDate
          console.log("Document successfully added!");
          markDocumentAsNotNew(cabinetName, docId);
        } catch (error) {
          console.error("Error adding document: ", error);
        }
      } else {
        try {
          await updateDoc(docRef, updateObject); // For existing documents (not covered by the isNew flag)
          console.log("Document successfully updated!");
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      }
    }

    handleToggleEditable(cabinetName, docId);
  };

  // Function to update the document state to mark it as not new
  const markDocumentAsNotNew = (cabinetName, docId) => {
    setCabinets((cabinets) =>
      cabinets.map((cabinet) => {
        if (cabinet.name === cabinetName) {
          return {
            ...cabinet,
            documents: cabinet.documents.map((doc) => {
              if (doc.id === docId) {
                return { ...doc, isNew: false }; // Remove the isNew flag
              }
              return doc;
            }),
          };
        }
        return cabinet;
      })
    );
  };

  const handleToggleEditable = (cabinetName, docId) => {
    setCabinets((cabinets) =>
      cabinets.map((cabinet) => {
        if (cabinet.name === cabinetName) {
          return {
            ...cabinet,
            documents: cabinet.documents.map((doc) => {
              if (doc.id === docId) {
                return { ...doc, isEditable: !doc.isEditable };
              }
              return doc;
            }),
          };
        }
        return cabinet;
      })
    );
  };

  const generateUniqueId = () =>
    `id-${Math.random().toString(36).substr(2, 9)}`;

  const addNewDocumentToCabinet = (cabinetName) => {
    setCabinets((cabinets) => {
      return cabinets.map((cabinet) => {
        if (cabinet.name === cabinetName) {
          const newDocument = {
            id: generateUniqueId(), // Ensure this ID is unique within your documents
            startTime: "",
            endTime: "",
            name: "",
            procedure: "",
            doctor: "",
            isEditable: true, // New document starts in editable mode
            isNew: true, // Indicate this document is new and not yet saved to Firestore
            date: selectedDate, // Optional: set the date to the currently selected date
          };
          return { ...cabinet, documents: [...cabinet.documents, newDocument] };
        }
        return cabinet;
      });
    });
  };

  return (
    <div>
      <input type="date" onChange={handleDateChange}></input>
      {cabinets.map((cabinet) => (
        <div key={cabinet.name}>
          <div>
            <h2>{cabinet.name}</h2>
            <button onClick={() => addNewDocumentToCabinet(cabinet.name)}>
              +
            </button>
          </div>
          <div>Start Time End Time Client Procedure Doctor</div>
          <div>
            {cabinet.documents
              .filter((doc) => doc.date?.split("T")[0] === selectedDate)
              .map((doc) => (
                <div key={doc.id}>
                  <input
                    id="startTime"
                    type="time"
                    readOnly={!doc.isEditable}
                    value={doc.startTime}
                    onChange={(e) =>
                      handleInputChange(
                        cabinet.name,
                        doc.id,
                        e.target.value,
                        "startTime"
                      )
                    }
                  ></input>
                  <input
                    id="endTime"
                    type="time"
                    readOnly={!doc.isEditable}
                    value={doc.endTime}
                    onChange={(e) =>
                      handleInputChange(
                        cabinet.name,
                        doc.id,
                        e.target.value,
                        "endTime"
                      )
                    }
                  ></input>
                  <input
                    value={doc.name}
                    readOnly={!doc.isEditable}
                    onChange={(e) =>
                      handleInputChange(
                        cabinet.name,
                        doc.id,
                        e.target.value,
                        "name"
                      )
                    }
                  />
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
                  ></input>
                  <input
                    id="doctor"
                    readOnly={!doc.isEditable}
                    value={doc.doctor}
                    onChange={(e) =>
                      handleInputChange(
                        cabinet.name,
                        doc.id,
                        e.target.value,
                        "doctor"
                      )
                    }
                  ></input>
                  <button onClick={() => handleEdit(cabinet.name, doc.id)}>
                    {doc.isEditable ? "Save" : "Edit"}
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
