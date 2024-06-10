import React, { useState, useEffect, useMemo } from "react"; // Import React and necessary hooks
import { auth, db } from "../config/firebase"; // Import Firebase configuration for authentication and database
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase authentication function
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from "firebase/firestore"; // Import Firestore functions

// Main component for employee scheduling
export default function EmployeeScheduling() {
  // State variables to manage form inputs and data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewDate, setViewDate] = useState("");
  const [employeesOnDate, setEmployeesOnDate] = useState([]);

  // Memoized references to Firestore collections
  const employeesCollection = useMemo(() => collection(db, "employees"), []);
  const schedulesCollection = useMemo(() => collection(db, "schedules"), []);

  // Fetch employees from Firestore when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      const employeesSnapshot = await getDocs(employeesCollection);
      const employeesList = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesList); // Update state with fetched employees
    };

    fetchEmployees();
  }, [employeesCollection]);

  // Handle creating a new employee
  const handleCreateEmployee = async (event) => {
    event.preventDefault(); // Prevent form from submitting normally
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "employees", user.uid), {
        firstName,
        lastName,
      });

      alert("Employee created successfully!");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");

      const employeesSnapshot = await getDocs(employeesCollection);
      const employeesList = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesList); // Refresh the list of employees
    } catch (error) {
      console.error("Error creating employee: ", error);
      alert(error.message);
    }
  };

  // Handle deleting an employee
  const handleDeleteEmployee = async (event) => {
    event.preventDefault(); // Prevent form from submitting normally
    try {
      const employeeToDelete = employees.find(
        (emp) => emp.id === selectedEmployee
      );
      const { firstName, lastName } = employeeToDelete;

      const userDocRef = doc(db, "employees", selectedEmployee);
      await deleteDoc(userDocRef); // Delete employee document from Firestore

      const batch = writeBatch(db); // Batch operations for Firestore
      const schedulesSnapshot = await getDocs(schedulesCollection);

      for (const scheduleDoc of schedulesSnapshot.docs) {
        const dateCollectionRef = collection(scheduleDoc.ref, "employees");
        const q = query(
          dateCollectionRef,
          where("firstName", "==", firstName),
          where("lastName", "==", lastName)
        );
        const employeeDocs = await getDocs(q);

        employeeDocs.forEach((employeeDoc) => {
          batch.delete(employeeDoc.ref); // Delete related schedule documents
        });
      }

      await batch.commit(); // Commit the batch operations

      alert("Employee deleted successfully!");
      setSelectedEmployee("");

      const employeesSnapshot = await getDocs(employeesCollection);
      const employeesList = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesList); // Refresh the list of employees
    } catch (error) {
      console.error("Error deleting employee: ", error);
      alert(error.message);
    }
  };

  // Handle scheduling an employee on a specific date
  const handleScheduleChange = async (event) => {
    event.preventDefault(); // Prevent form from submitting normally
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
        firstName: employees.find((emp) => emp.id === selectedEmployee)
          .firstName,
        lastName: employees.find((emp) => emp.id === selectedEmployee).lastName,
      });

      alert("Schedule updated successfully!");
    } catch (error) {
      console.error("Error updating schedule: ", error);
      alert(error.message);
    }
  };

  // Handle viewing employees scheduled on a specific date
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
    setEmployeesOnDate(employeesList); // Update state with employees scheduled on the selected date
  };

  // Handle removing an employee from the schedule on a specific date
  const handleDeleteFromSchedule = async (employeeId) => {
    const [year, month, day] = viewDate.split("-");
    const scheduleRef = doc(
      db,
      "schedules",
      `${year}-${month}-${day}`,
      "employees",
      employeeId
    );
    await deleteDoc(scheduleRef); // Delete the schedule document from Firestore
    handleViewDateChange({ target: { value: viewDate } }); // Refresh the list of employees on the selected date
  };

  // Function to handle first and last name input change with validation
  const handleNameChange = (setter) => (event) => {
    const { value } = event.target;
    const lettersOnly = /^[A-Za-z\s]*$/;
    if (lettersOnly.test(value)) {
      setter(value);
    } else {
      alert("Only letters are allowed for First Name and Last Name.");
    }
  };

  // JSX to render the employee scheduling form and list
  return (
    <div className="container mx-auto p-4 overflow-auto">
      <h2 className="text-2xl font-bold mb-4">Create Employee</h2>
      <form onSubmit={handleCreateEmployee} className="mb-6">
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={firstName}
            onChange={handleNameChange(setFirstName)}
            placeholder="First Name"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={lastName}
            onChange={handleNameChange(setLastName)}
            placeholder="Last Name"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Create Employee
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Delete Employee</h2>
      <form onSubmit={handleDeleteEmployee} className="mb-6">
        <div className="mb-4">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Employee to Delete</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-red-500 text-white p-2 rounded"
        >
          Delete Employee
        </button>
      </form>

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
