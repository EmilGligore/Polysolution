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
  const [cabinets, setCabinets] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [hoveredDocId, setHoveredDocId] = useState(null);

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

  return (
    <div className="flex-grow">
      <div className="flex items-center justify-center border-b border-gray-200 h-12">
        <input type="date" onChange={handleDateChange} className=""></input>
      </div>
      {cabinets.map((cabinet) => (
        <div key={cabinet.name} className=" bg-white rounded">
          <div className="flex items-center justify-center h-12 border-b border-gray-200">
            <h2 className="text-lg font-bold w-full pl-2">{cabinet.name}</h2>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 h-12">
            <div className="flex-grow flex justify-start items-start">
              <span className="ml-2 font-semibold w-1/5">Start Time</span>
              <span className="w-1/5 font-semibold">End Time</span>
              <span className="w-1/5 font-semibold">Client</span>
              <span className="w-1/5 font-semibold">Procedure</span>
              <span className="w-1/5 font-semibold">Doctor</span>
            </div>

            <button
              onClick={() => addNewDocumentToCabinet(cabinet.name)}
              className="bg-blue-500 hover:bg-blue-700 w-[148px] rounded mr-3 my-2 py-1"
            >
              + Add
            </button>
          </div>
          {cabinet.documents
            .filter((doc) => doc.date?.split("T")[0] === selectedDate)
            .map((doc) => (
              <div
                key={doc.id}
                className="flex justify-between items-center h-12 border-b border-gray-200"
                onMouseEnter={() => setHoveredDocId(doc.id)}
                onMouseLeave={() => setHoveredDocId(null)}
              >
                <div className="w-[85%]">
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
                    className="ml-2 w-13 "
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
                    className="w-13 ml-[134px]"
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
                    className="w-1/6 ml-[134px]"
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
                    className="w-1/6 ml-[39px]"
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
                    className="w-[140px] ml-[38px]"
                  ></input>
                </div>
                <div
                  className={`flex ${hoveredDocId === doc.id ? "" : "hidden"}`}
                >
                  <button
                    onClick={() => handleEdit(cabinet.name, doc.id)}
                    className={`${
                      doc.isEditable ? "bg-blue-500" : "bg-blue-500"
                    } hover:bg-blue-700 py-1 px-4 m-1 rounded`}
                    style={{ width: "70px" }}
                  >
                    {doc.isEditable ? "Save" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(cabinet.name, doc.id)}
                    className="bg-blue-500 hover:bg-blue-700 py-1 m-1 mr-3 rounded"
                    style={{ width: "70px" }}
                  >
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
