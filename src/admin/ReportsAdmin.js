import React, { useState, useEffect, useMemo } from "react"; // Import React and necessary hooks
import { db } from "../config/firebase"; // Import Firebase configuration
import { getDocs, collection } from "firebase/firestore"; // Import Firestore functions for data retrieval
import * as XLSX from "xlsx"; // Import XLSX for handling Excel file creation
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"; // Import Chart.js components for chart rendering

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Main component for generating and exporting reports
export default function Reports() {
  const [clients, setClients] = useState([]); // State to store list of clients
  const [appointments, setAppointments] = useState([]); // State to store list of appointments
  const [startDate, setStartDate] = useState(""); // State to store the start date for report filtering
  const [endDate, setEndDate] = useState(""); // State to store the end date for report filtering
  const [reportType, setReportType] = useState(""); // State to track selected report type

  // Memoized reference to the Firestore collection "clients"
  const clientsCollectionRef = useMemo(() => collection(db, "clients"), []);

  // Memoized references to Firestore collections for different cabinets
  const cabinetCollections = useMemo(() => {
    return ["Cabinet 1", "Cabinet 2", "Cabinet 3"].map((cabinetName) => ({
      name: cabinetName,
      collectionRef: collection(db, "cabinets", "cabinets", cabinetName),
    }));
  }, []);

  // Fetch data from Firestore when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      // Fetch clients data
      const clientsData = await getDocs(clientsCollectionRef);
      setClients(clientsData.docs.map((doc) => doc.data()));

      // Fetch appointments data from each cabinet
      const appointmentsData = [];
      for (const cabinet of cabinetCollections) {
        const querySnapshot = await getDocs(cabinet.collectionRef);
        querySnapshot.forEach((doc) => {
          appointmentsData.push(doc.data());
        });
      }
      setAppointments(appointmentsData);
    };
    fetchData();
  }, [clientsCollectionRef, cabinetCollections]);

  // Handle export of the selected report to Excel
  const handleExport = () => {
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    let sheetData = [];
    let reportName = reportType;

    // Prepare data based on the selected report type
    switch (reportType) {
      case "totalClients":
        sheetData = clients;
        reportName = "Total Clients";
        break;
      case "appointments":
        sheetData = appointments.filter((appointment) => {
          const appointmentDate = new Date(appointment.date);
          return (
            appointmentDate >= new Date(startDate) &&
            appointmentDate <= new Date(endDate)
          );
        });
        reportName = `Appointments_${startDate}_to_${endDate}`;
        break;
      case "clientDemographics":
        sheetData = clients.map((client) => ({
          gender: client.gender,
          birthdate: client.birthdate,
        }));
        reportName = "Client Demographics";
        break;
      case "appointmentTypes":
        sheetData = appointments
          .filter((appointment) => {
            const appointmentDate = new Date(appointment.date);
            return (
              appointmentDate >= new Date(startDate) &&
              appointmentDate <= new Date(endDate)
            );
          })
          .map((appointment) => ({
            date: appointment.date,
            procedure: appointment.procedure,
          }));
        reportName = `Appointment Types_${startDate}_to_${endDate}`;
        break;
      case "clientHealthIssues":
        sheetData = clients.map((client) => ({
          healthIssues: client.healthproblems,
        }));
        reportName = "Client Health Issues";
        break;
      default:
        break;
    }

    // If no data is available for the selected report type and date range
    if (sheetData.length === 0) {
      sheetData.push({
        message: "No data available for selected report type and date range",
      });
    }

    // Create a sheet and append it to the workbook
    const sheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, reportType);
    XLSX.writeFile(workbook, `${reportName}.xlsx`); // Save the workbook as an Excel file
  };

  // Validate the date range
  const isValidDateRange = () => {
    return new Date(startDate) <= new Date(endDate);
  };

  // Validate the form inputs
  const isFormValid = () => {
    if (
      ["totalClients", "clientDemographics", "clientHealthIssues"].includes(
        reportType
      )
    ) {
      return reportType;
    }
    return reportType && startDate && endDate && isValidDateRange();
  };

  // JSX to render the report generation form and export button
  return (
    <div className="p-4">
      <div className="mb-4">
        <label htmlFor="reportType" className="block mb-2">
          Report Type:
        </label>
        <select
          id="reportType"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="">Select Report Type</option>
          <option value="totalClients">Total Clients</option>
          <option value="appointments">Appointments</option>
          <option value="clientDemographics">Client Demographics</option>
          <option value="appointmentTypes">Appointment Types</option>
          <option value="clientHealthIssues">Client Health Issues</option>
        </select>
      </div>
      {["appointments", "appointmentTypes"].includes(reportType) && (
        <>
          <div className="mb-4">
            <label htmlFor="startDate" className="block mb-2">
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded w-full"
              disabled={!reportType}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="endDate" className="block mb-2">
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded w-full"
              disabled={!startDate}
              min={startDate}
            />
          </div>
        </>
      )}
      <button
        onClick={handleExport}
        disabled={!isFormValid()}
        className={`font-bold py-2 px-4 rounded mb-4 ${
          !isFormValid()
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-blue-500 hover:bg-blue-700 text-white"
        }`}
      >
        Export to Excel
      </button>
    </div>
  );
}
