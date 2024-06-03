// src/admin/BedsAdmin.js

import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";

export default function BedsAdmin() {
  const [beds, setBeds] = useState([]);

  const bedsCollectionRef = useMemo(() => collection(db, "beds"), []);

  useEffect(() => {
    const fetchData = async () => {
      const bedsData = await getDocs(bedsCollectionRef);
      setBeds(bedsData.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [bedsCollectionRef]);

  const handleAddBed = async () => {
    const bedNumber = prompt("Enter the number of the new bed:");
    if (bedNumber) {
      await addDoc(bedsCollectionRef, { number: bedNumber });
      setBeds([...beds, { number: bedNumber }]);
    }
  };

  const handleDeleteBed = async (bedId) => {
    await deleteDoc(doc(db, "beds", bedId));
    setBeds(beds.filter(bed => bed.id !== bedId));
  };

  return (
    <div>
      <h1>Manage Beds</h1>
      <button onClick={handleAddBed}>Add New Bed</button>
      <ul>
        {beds.map(bed => (
          <li key={bed.id}>
            {bed.number}
            <button onClick={() => handleDeleteBed(bed.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
