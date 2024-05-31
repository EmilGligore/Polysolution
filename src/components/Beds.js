import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function Beds() {
  const [beds, setBeds] = useState([]);
  const [clients, setClients] = useState([]);

  const bedsCollection = useMemo(() => collection(db, "beds"), []);
  const clientsCollectionRef = useMemo(() => collection(db, "clients"), []);

  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const querySnapshot = await getDocs(bedsCollection);
        const bedsArray = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            patient: doc.data().pacient,
            occupied: doc.data().occupied,
            number: doc.data().number,
          }))
          .sort((a, b) => a.number - b.number);
        setBeds(bedsArray);
      } catch (error) {
        console.error("Error fetching beds:", error);
      }
    };

    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(clientsCollectionRef);
        const clientsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().surname}`,
        }));
        setClients(clientsArray);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchBeds();
    fetchClients();
  }, [bedsCollection, clientsCollectionRef]);

  const handlePatientChange = async (bedId, newPatient) => {
    const bedDocRef = doc(db, "beds", bedId);
    const occupiedValue = newPatient !== "";
    try {
      await updateDoc(bedDocRef, {
        pacient: newPatient,
        occupied: occupiedValue,
      });

      const updatedBeds = beds.map((bed) =>
        bed.id === bedId
          ? { ...bed, patient: newPatient, occupied: occupiedValue }
          : bed
      );
      setBeds(updatedBeds);
    } catch (error) {
      console.error("Error updating patient:", error);
    }
  };

  const handleOccupiedChange = async (bedId, newOccupied) => {
    const bedDocRef = doc(db, "beds", bedId);
    const occupiedValue = newOccupied === "Yes";
    try {
      await updateDoc(bedDocRef, { occupied: occupiedValue });

      const updatedBeds = beds.map((bed) =>
        bed.id === bedId ? { ...bed, occupied: occupiedValue } : bed
      );
      setBeds(updatedBeds);
    } catch (error) {
      console.error("Error updating occupied status:", error);
    }
  };

  return (
    <div className="flex-grow">
      <table className="h-12 border-b border-gray-200 w-full">
        <thead className="h-12 border-b border-gray-200">
          <tr className="h-12 border-b border-gray-200">
            <th className="text-left pl-1.5">Bed No.</th>
            <th className="text-left">Patient</th>
            <th className="text-left">Occupied</th>
          </tr>
        </thead>
        <tbody>
          {beds.map((bed) => (
            <tr key={bed.id} className="h-12 border-b border-gray-200">
              <td className="pl-1.5">{`Bed No. ${bed.number}`}</td>
              <td>
                <select
                  value={bed.patient}
                  onChange={(e) => handlePatientChange(bed.id, e.target.value)}
                >
                  <option value="">Select Patient</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={bed.occupied ? "Yes" : "No"}
                  onChange={(e) => handleOccupiedChange(bed.id, e.target.value)}
                  disabled={!bed.patient}
                >
                  <option value="Yes" disabled={!bed.patient}>
                    Yes
                  </option>
                  <option value="No">No</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
