import React, { useState, useEffect, useCallback, useMemo } from "react"; // Import React and necessary hooks
import { db } from "../config/firebase"; // Import Firebase configuration
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc
} from "firebase/firestore"; // Import Firestore functions

// Main component for managing beds
export default function BedsAdmin() {
  const [beds, setBeds] = useState([]); // State to store list of beds
  const [clients, setClients] = useState([]); // State to store list of clients

  // Memoized references to the Firestore collections "beds" and "clients"
  const bedsCollectionRef = useMemo(() => collection(db, "beds"), []);
  const clientsCollectionRef = useMemo(() => collection(db, "clients"), []);

  // Function to fetch bed data from Firestore
  const fetchBeds = useCallback(async () => {
    const querySnapshot = await getDocs(bedsCollectionRef);
    const bedsArray = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        patient: doc.data().pacient,
        occupied: doc.data().occupied,
        number: parseInt(doc.data().number, 10),
      }))
      .sort((a, b) => a.number - b.number); // Sort beds by number
    setBeds(bedsArray); // Update state with fetched beds
  }, [bedsCollectionRef]);

  // useEffect hook to fetch beds and clients when the component mounts
  useEffect(() => {
    fetchBeds();
    const fetchClients = async () => {
      const querySnapshot = await getDocs(clientsCollectionRef);
      const clientsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: `${doc.data().firstName} ${doc.data().surname}`,
      }));
      setClients(clientsArray); // Update state with fetched clients
    };
    fetchClients();
  }, [bedsCollectionRef, clientsCollectionRef, fetchBeds]);

  // Handle adding a new bed
  const handleAddBed = async () => {
    const bedNumber = prompt("Enter the number of the new bed:");
    if (bedNumber) {
      await addDoc(bedsCollectionRef, { number: bedNumber, occupied: false, pacient: "" });
      fetchBeds(); // Refresh beds after adding
    }
  };

  // Handle deleting a bed
  const handleDeleteBed = async (bedId) => {
    await deleteDoc(doc(db, "beds", bedId));
    fetchBeds(); // Refresh beds after deleting
  };

  // Handle changing the patient assigned to a bed
  const handlePatientChange = async (bedId, newPatient) => {
    const bedDocRef = doc(db, "beds", bedId);
    const occupiedValue = newPatient !== "";
    await updateDoc(bedDocRef, {
      pacient: newPatient,
      occupied: occupiedValue,
    });
    fetchBeds(); // Refresh beds after updating
  };

  // JSX to render the bed management table
  return (
    <div className="flex-grow overflow-auto p-4">
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAddBed} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Bed
        </button>
      </div>
      <table className="w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="text-left p-2 border-b">Bed No.</th>
            <th className="text-left p-2 border-b">Patient</th>
            <th className="text-left p-2 border-b">Occupied</th>
            <th className="text-left p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {beds.map((bed) => (
            <tr key={bed.id}>
              <td className="p-2 border-b">{`Bed No. ${bed.number}`}</td>
              <td className="p-2 border-b">
                <select
                  value={bed.patient}
                  onChange={(e) => handlePatientChange(bed.id, e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Patient</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2 border-b">
                {bed.occupied ? "Yes" : "No"}
              </td>
              <td className="p-2 border-b">
                <button 
                  onClick={() => handleDeleteBed(bed.id)} 
                  className="py-1 px-2 bg-red-500 hover:bg-red-700 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
