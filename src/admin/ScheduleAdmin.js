// src/admin/ScheduleAdmin.js

import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebase";
import { getDocs, collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function ScheduleAdmin() {
  const [appointments, setAppointments] = useState([]);
  const [newCabinet, setNewCabinet] = useState("");

  const cabinetCollections = useMemo(() => {
    return ["Cabinet 1", "Cabinet 2", "Cabinet 3"].map((cabinetName) => ({
      name: cabinetName,
      collectionRef: collection(db, "cabinets", "cabinets", cabinetName),
    }));
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      const allAppointments = [];
      for (const cabinet of cabinetCollections) {
        const querySnapshot = await getDocs(cabinet.collectionRef);
        querySnapshot.forEach((doc) => {
          allAppointments.push({ ...doc.data(), id: doc.id, cabinet: cabinet.name });
        });
      }
      setAppointments(allAppointments);
    };
    fetchAppointments();
  }, [cabinetCollections]);

  const handleAddCabinet = async () => {
    if (newCabinet) {
      await addDoc(collection(db, "cabinets", "cabinets", newCabinet), {});
      setNewCabinet("");
      // Refresh appointments
      const fetchAppointments = async () => {
        const allAppointments = [];
        for (const cabinet of cabinetCollections) {
          const querySnapshot = await getDocs(cabinet.collectionRef);
          querySnapshot.forEach((doc) => {
            allAppointments.push({ ...doc.data(), id: doc.id, cabinet: cabinet.name });
          });
        }
        setAppointments(allAppointments);
      };
      fetchAppointments();
    }
  };

  const handleDeleteCabinet = (cabinetName) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure you want to delete the cabinet "${cabinetName}"? This will delete all appointments in this cabinet.`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            const cabinetRef = collection(db, "cabinets", "cabinets", cabinetName);
            const querySnapshot = await getDocs(cabinetRef);
            querySnapshot.forEach(async (doc) => {
              await deleteDoc(doc.ref);
            });
            // Refresh appointments
            const fetchAppointments = async () => {
              const allAppointments = [];
              for (const cabinet of cabinetCollections) {
                const querySnapshot = await getDocs(cabinet.collectionRef);
                querySnapshot.forEach((doc) => {
                  allAppointments.push({ ...doc.data(), id: doc.id, cabinet: cabinet.name });
                });
              }
              setAppointments(allAppointments);
            };
            fetchAppointments();
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Manage Cabinets</h2>
        <div className="mb-2">
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="New Cabinet Name"
            value={newCabinet}
            onChange={(e) => setNewCabinet(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleAddCabinet}
        >
          Add Cabinet
        </button>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Existing Cabinets</h2>
        {cabinetCollections.map((cabinet) => (
          <div key={cabinet.name} className="mb-2">
            <span className="text-lg">{cabinet.name}</span>
            <button
              className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
              onClick={() => handleDeleteCabinet(cabinet.name)}
            >
              Delete Cabinet
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
