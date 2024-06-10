import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export default function EmployeeScheduling() {
  // State to manage the list of employees
  const [employees, setEmployees] = useState([]);
  // State to manage the selected employee
  const [selectedEmployee, setSelectedEmployee] = useState("");
  // State to manage the selected date for scheduling
  const [selectedDate, setSelectedDate] = useState("");
  // State to manage the view date for viewing employees
  const [viewDate, setViewDate] = useState("");
  // State to manage the list of employees scheduled on a specific date
  const [employeesOnDate, setEmployeesOnDate] = useState([]);

  // Memoize the reference to the 'employees' collection to avoid unnecessary re-renders
  const employeesCollection = useMemo(() => collection(db, "employees"), []);

  // Fetch employees from Firestore when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      const employeesSnapshot = await getDocs(employeesCollection);
      const employeesList = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesList);
    };

    fetchEmployees();
  }, [employeesCollection]);

  // Handle schedule change form submission
  const handleScheduleChange = async (event) => {
    event.preventDefault();
    if (!selectedDate || !selectedEmployee) {
      alert("Please select a date and an employee.");
      return;
    }
    try {
      const [year, month, day] = selectedDate.split("-");
      const scheduleRef = doc(
        db,
        "schedules",
        `${year}-${month}-${day}`,
        "employees",
        selectedEmployee
      );
      await setDoc(scheduleRef, {
        firstName: employees.find((emp) => emp.id === selectedEmployee).firstName,
        lastName: employees.find((emp) => emp.id === selectedEmployee).lastName,
      });

      alert("Schedule updated successfully!");
    } catch (error) {
      console.error("Error updating schedule: ", error);
      alert(error.message);
    }
  };

  // Handle date change for viewing employees
  const handleViewDateChange = async (e) => {
    setViewDate(e.target.value);
    const [year, month, day] = e.target.value.split("-");
    const employeesCollectionRef = collection(
      db,
      "schedules",
      `${year}-${month}-${day}`,
      "employees"
    );
    const employeesSnapshot = await getDocs(employeesCollectionRef);
    const employeesList = employeesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEmployeesOnDate(employeesList);
  };

  // Handle removing an employee from the schedule
  const handleDeleteFromSchedule = async (employeeId) => {
    const [year, month, day] = viewDate.split("-");
    const scheduleRef = doc(
      db,
      "schedules",
      `${year}-${month}-${day}`,
      "employees",
      employeeId
    );
    await deleteDoc(scheduleRef);
    handleViewDateChange({ target: { value: viewDate } });
  };

  // Render the component
  return (
    <div className="container mx-auto p-4 overflow-auto">
      <h2 className="text-2xl font-bold mb-4">Schedule Employee</h2>
      <form onSubmit={handleScheduleChange} className="mb-6">
        <div className="mb-4">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          Save Schedule
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">View Employees on Date</h2>
      <div className="mb-4">
        <input
          type="date"
          value={viewDate}
          onChange={handleViewDateChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <ul className="space-y-2">
        {employeesOnDate.map((employee) => (
          <li
            key={employee.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <span>
              {employee.firstName} {employee.lastName}
            </span>
            <button
              onClick={() => handleDeleteFromSchedule(employee.id)}
              className="bg-red-500 text-white p-2 rounded"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
