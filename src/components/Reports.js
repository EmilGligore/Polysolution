import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";
import * as XLSX from "xlsx";
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
} from "chart.js";

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

export default function Reports() {
  // State to manage clients data
  const [clients, setClients] = useState([]);
  // State to manage appointments data
  const [appointments, setAppointments] = useState([]);
  // State to manage the start date for reports
  const [startDate, setStartDate] = useState("");
  // State to manage the end date for reports
  const [endDate, setEndDate] = useState("");
  // State to manage the selected report type
  const [reportType, setReportType] = useState("");

  // Memoize the reference to the 'clients' collection to avoid unnecessary re-renders
  const clientsCollectionRef = useMemo(() => collection(db, "clients"), []);

  // Memoize the references to the 'cabinets' collections to avoid unnecessary re-renders
  const cabinetCollections = useMemo(() => {
    return ["Cabinet 1", "Cabinet 2", "Cabinet 3"].map((cabinetName) => ({
      name: cabinetName,
      collectionRef: collection(db, "cabinets", "cabinets", cabinetName),
    }));
  }, []);

  // Fetch clients and appointments data from Firestore when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const clientsData = await getDocs(clientsCollectionRef);
      setClients(clientsData.docs.map((doc) => doc.data()));

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

  // Handle exporting data to Excel
  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    let sheetData = [];
    let reportName = reportType;

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

    if (sheetData.length === 0) {
      sheetData.push({
        message: "No data available for selected report type and date range",
      });
    }

    const sheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, reportType);
    XLSX.writeFile(workbook, `${reportName}.xlsx`);
  };

  // Validate date range for reports
  const isValidDateRange = () => {
    return new Date(startDate) <= new Date(endDate);
  };

  // Validate form inputs for generating reports
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

  // Render the component
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
