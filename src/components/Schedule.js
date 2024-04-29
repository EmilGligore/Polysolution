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

    const updateObject = {
      name: docToUpdate.name,
      startTime: docToUpdate.startTime,
      endTime: docToUpdate.endTime,
      procedure: docToUpdate.procedure,
      doctor: docToUpdate.doctor,
      date: selectedDate,
    };

    if (docToUpdate.isEditable) {
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
    }

    handleToggleEditable(cabinetName, docId);
  };

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
            id: generateUniqueId(),
            startTime: "",
            endTime: "",
            name: "",
            procedure: "",
            doctor: "",
            isEditable: true,
            isNew: true,
            date: selectedDate,
          };
          return { ...cabinet, documents: [...cabinet.documents, newDocument] };
        }
        return cabinet;
      });
    });
  };

  return (
    <div className="bg-BackgroundAuth w-screen">
      <input
        type="date"
        onChange={handleDateChange}
        className="m-4 p-2"
      ></input>
      {cabinets.map((cabinet) => (
        <div key={cabinet.name} className="mb-4 bg-white w-2/3 rounded ml-10">
          <div className="flex items-center justify-between p-2">
            <h2 className="text-lg text-center w-full">{cabinet.name}</h2>
          </div>
          <div className="flex justify-between items-center">
            <div class="flex-grow flex justify-start px-4 py-2 bg-blue-500 text-white rounded ml-3 mr-3">
              <span className="mr-16">Start Time</span>
              <span className="mr-16">End Time</span>
              <span className="mr-16">Client</span>
              <span className="mr-16">Procedure</span>
              <span>Doctor</span>
            </div>

            <button
              onClick={() => addNewDocumentToCabinet(cabinet.name)}
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 w-[148px] rounded mr-3 "
            >
              + Add
            </button>
          </div>
          {cabinet.documents
            .filter((doc) => doc.date?.split("T")[0] === selectedDate)
            .map((doc) => (
              <div
                key={doc.id}
                className="flex justify-between items-center p-2"
              >
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
                  className="m-1 p-1 rounded w-1/5"
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
                  className="m-1 p-1 rounded w-1/5"
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
                  className="m-1 p-1 rounded w-1/5"
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
                  className="m-1 p-1 rounded w-1/5"
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
                  className="m-1 p-1  rounded w-1/5"
                ></input>
                <div className="flex">
                  <button
                    onClick={() => handleEdit(cabinet.name, doc.id)}
                    className={`${
                      doc.isEditable ? "bg-blue-500" : "bg-blue-500"
                    } hover:bg-blue-700 text-white py-2 px-4 m-1 rounded`}
                  >
                    {doc.isEditable ? "Save" : "Edit"}
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 m-1 rounded">
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
