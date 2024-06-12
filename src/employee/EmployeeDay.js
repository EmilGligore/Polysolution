import React, { useEffect, useState, useMemo } from "react";
import { db, auth } from "../config/firebase"; // Make sure to import auth from your firebase config
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function EmployeeDay() {
  // State to manage the logged-in employee's name
  const [employeeName, setEmployeeName] = useState("");
  // State to manage the selected date (defaults to today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  });
  // State to manage the schedules
  const [schedules, setSchedules] = useState([]);

  // Function to fetch the employee's schedule from Firestore
  const fetchSchedules = async (date, name) => {
    const cabinetNames = ["Cabinet 1", "Cabinet 2", "Cabinet 3"];
    const schedulesArray = [];

    for (const cabinetName of cabinetNames) {
      const cabinetCollectionRef = collection(db, "cabinets", "cabinets", cabinetName);
      const q = query(
        cabinetCollectionRef,
        where("doctor", "==", name),
        where("date", "==", date)
      );
      const querySnapshot = await getDocs(q);
      const cabinetSchedules = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        cabinet: cabinetName,
      }));
      schedulesArray.push(...cabinetSchedules);
    }
    return schedulesArray;
  };

  // useEffect to get the current user and set the employeeName
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const employeeDocRef = doc(db, "employees", user.uid);
          const employeeDoc = await getDoc(employeeDocRef);
          if (employeeDoc.exists()) {
            const employeeData = employeeDoc.data();
            setEmployeeName(`${employeeData.firstName} ${employeeData.lastName}`);
          } else {
            console.error("No employee data found for the current user.");
          }
        } catch (error) {
          console.error("Error fetching employee data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  console.log(employeeName);

  // useMemo to memoize the fetched schedule
  useMemo(() => {
    if (employeeName) {
      let isSubscribed = true;
      fetchSchedules(selectedDate, employeeName).then((data) => {
        if (isSubscribed) {
          setSchedules(data);
        }
      });
      return () => (isSubscribed = false);
    }
  }, [selectedDate, employeeName]);

  // Function to handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Render the component
  return (
    <div className="flex-grow overflow-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Schedule</h2>
      <div className="flex items-center justify-center mb-4">
        <button
          onClick={() =>
            setSelectedDate(
              new Date(
                new Date(selectedDate).setDate(
                  new Date(selectedDate).getDate() - 1
                )
              )
                .toISOString()
                .split("T")[0]
            )
          }
          className="mx-2 hover:bg-gray-300 rounded-full p-1"
        >
          {"<"}
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border rounded p-2"
        ></input>
        <button
          onClick={() =>
            setSelectedDate(
              new Date(
                new Date(selectedDate).setDate(
                  new Date(selectedDate).getDate() + 1
                )
              )
                .toISOString()
                .split("T")[0]
            )
          }
          className="mx-2 hover:bg-gray-300 rounded-full p-1"
        >
          {">"}
        </button>
      </div>
      <div className="bg-white rounded shadow-md">
        <table className="w-full bg-white shadow-md rounded">
          <thead>
            <tr>
              <th className="text-left p-2 border-b">Start Time</th>
              <th className="text-left p-2 border-b">End Time</th>
              <th className="text-left p-2 border-b">Patient</th>
              <th className="text-left p-2 border-b">Procedure</th>
              <th className="text-left p-2 border-b">Cabinet</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="p-2 border-b">{schedule.startTime}</td>
                <td className="p-2 border-b">{schedule.endTime}</td>
                <td className="p-2 border-b">{schedule.name}</td>
                <td className="p-2 border-b">{schedule.procedure}</td>
                <td className="p-2 border-b">{schedule.cabinet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
