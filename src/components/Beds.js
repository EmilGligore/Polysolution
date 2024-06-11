import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function BedsAdmin() {
  // State to manage the list of beds
  const [beds, setBeds] = useState([]);
  // State to manage the list of clients
  const [clients, setClients] = useState([]);

  // Memoize the reference to the 'beds' collection to avoid unnecessary re-renders
  const bedsCollectionRef = useMemo(() => collection(db, "beds"), []);
  // Memoize the reference to the 'clients' collection to avoid unnecessary re-renders
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
      .sort((a, b) => a.number - b.number); // Sort beds by bed number
    setBeds(bedsArray);
  }, [bedsCollectionRef]);

  // useEffect to fetch bed and client data when the component mounts
  useEffect(() => {
    fetchBeds(); // Fetch beds on mount
    // Function to fetch client data from Firestore
    const fetchClients = async () => {
      const querySnapshot = await getDocs(clientsCollectionRef);
      const clientsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: `${doc.data().firstName} ${doc.data().surname}`,
      }));
      setClients(clientsArray);
    };
    fetchClients(); // Fetch clients on mount
  }, [bedsCollectionRef, clientsCollectionRef, fetchBeds]);

  // Function to handle patient change for a bed
  const handlePatientChange = async (bedId, newPatient) => {
    const bedDocRef = doc(db, "beds", bedId);
    const occupiedValue = newPatient !== ""; // Determine if the bed is occupied
    await updateDoc(bedDocRef, {
      pacient: newPatient,
      occupied: occupiedValue,
    });
    fetchBeds(); // Refresh the list of beds after updating
  };

  // Render the component
  return (
    <div className="flex-grow overflow-auto p-4 h-full">
      <div className="h-full overflow-y-auto">
        <table className="w-full bg-white shadow-md rounded">
          <thead>
            <tr>
              <th className="text-left p-2 border-b">Bed No.</th>
              <th className="text-left p-2 border-b">Patient</th>
              <th className="text-left p-2 border-b">Occupied</th>
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
                <td className="p-2 border-b">{bed.occupied ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
