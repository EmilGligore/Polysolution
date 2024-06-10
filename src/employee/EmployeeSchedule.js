import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

export default function EmployeeSchedule() {
  // Use AuthState hook to get the current user
  const [user] = useAuthState(auth);

  // State to hold the days the employee works
  const [employeeWorkDays, setEmployeeWorkDays] = useState([]);

  // Memoize the current date to prevent unnecessary recalculations
  const currentDate = useMemo(() => new Date(), []);

  // Memoize the first and last day of the current month
  const firstDayOfMonth = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const lastDayOfMonth = useMemo(() => endOfMonth(currentDate), [currentDate]);

  // Memoize the days in the current month
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth }).map((day) =>
      format(day, "yyyy-MM-dd")
    );
  }, [firstDayOfMonth, lastDayOfMonth]);

  // Effect to fetch the employee's workdays from Firestore
  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        let workDays = [];
        // Loop through each day in the current month
        for (const day of daysInMonth) {
          // Create a reference to the document for the specific day and employee
          const dayDocRef = doc(db, "schedules", day, "employees", user.uid);
          // Fetch the document
          const dayDoc = await getDoc(dayDocRef);
          // If the document exists, add the day to the workDays array
          if (dayDoc.exists()) {
            workDays.push(day);
          }
        }
        // Update the state with the fetched workdays
        setEmployeeWorkDays(workDays);
      }
    };

    fetchAppointments();
  }, [user, daysInMonth]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Schedule for {format(currentDate, "MMMM yyyy")}</h2>
      <div className="grid grid-cols-7 gap-4">
        {/* Render the days of the week */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-bold text-center">{day}</div>
        ))}
        {/* Render each day in the current month */}
        {daysInMonth.map((day) => (
          <div
            key={day}
            className={`p-4 border rounded text-center ${employeeWorkDays.includes(day) ? "bg-green-500 text-white" : "bg-white"}`}
          >
            {format(new Date(day), "d")}
          </div>
        ))}
      </div>
    </div>
  );
}
