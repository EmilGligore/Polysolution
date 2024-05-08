import React, { useState } from "react";

export default function Beds() {
  const [beds, setBeds] = useState([
    { id: 1, patient: "Alexandru", occupied: true },
    { id: 2, patient: "None", occupied: false },
    { id: 3, patient: "Alexandru", occupied: true },
  ]);

  const handleOccupiedChange = (bedId, newOccupied) => {
    const updatedBeds = beds.map((bed) =>
      bed.id === bedId ? { ...bed, occupied: newOccupied === "Yes" } : bed
    );
    setBeds(updatedBeds);
  };

  return (
    <div>
      <h1>Beds Availability</h1>
      <table>
        <thead>
          <tr>
            <th>Bed No.</th>
            <th>Patient</th>
            <th>Occupied</th>
          </tr>
        </thead>
        <tbody>
          {beds.map((bed) => (
            <tr key={bed.id}>
              <td>{`Bed No. ${bed.id}`}</td>
              <td>{bed.patient}</td>
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
