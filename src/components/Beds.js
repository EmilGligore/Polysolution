import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  deleteDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

export default function Beds() {
  const [beds, setBeds] = useState([]);

  useEffect(() => {
    const fetchBeds = async () => {
      const querySnapshot = await getDocs(collection(db, "beds"));
      const bedsArray = querySnapshot.docs.map(doc => ({
        id: doc.id, 
        patient: doc.data().pacient, 
        occupied: doc.data().occupied,
        number: doc.data().number
      })).sort((a, b) => a.number - b.number);
      setBeds(bedsArray);
    };
    

    fetchBeds();
  }, []);

  const handlePatientChange = async (bedId, newPatient) => {
    const bedDocRef = doc(db, "beds", bedId);
    await updateDoc(bedDocRef, { pacient: newPatient });  // Note: 'pacient' must match your Firestore field
  
    const updatedBeds = beds.map((bed) =>
      bed.id === bedId ? { ...bed, patient: newPatient } : bed
    );
    setBeds(updatedBeds);
  };

  const handleOccupiedChange = async (bedId, newOccupied) => {
    const bedDocRef = doc(db, "beds", bedId);
    const occupiedValue = newOccupied === "Yes";
    await updateDoc(bedDocRef, { occupied: occupiedValue });
  
    // Update local state
    const updatedBeds = beds.map((bed) =>
      bed.id === bedId ? { ...bed, occupied: occupiedValue } : bed
    );
    setBeds(updatedBeds);
  };

  return (
    <div className="flex-grow">
      <h1 className="flex font-bold border-b border-gray-200 h-12 justify-start items-center pl-1.5 ">Beds Availability</h1>
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
                <input
                  value={bed.patient}
                  onChange={(e) => handlePatientChange(bed.id, e.target.value)}
                />
              </td>
              <td>
                <select
                  value={bed.occupied ? "Yes" : "No"}
                  onChange={(e) => handleOccupiedChange(bed.id, e.target.value)}
                >
                  <option value="Yes">Yes</option>
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
