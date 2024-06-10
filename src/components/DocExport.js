import React, { useState, useEffect, useMemo } from "react";
import htmlDocx from "html-docx-js/dist/html-docx";
import { saveAs } from "file-saver";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function DocExport() {
  // State to manage the document type
  const [documentType, setDocumentType] = useState("");
  // State to manage the list of clients
  const [clients, setClients] = useState([]);
  // State to manage the selected client
  const [selectedClient, setSelectedClient] = useState("");
  // State to manage the admission date
  const [admissionDate, setAdmissionDate] = useState("");
  // State to manage the procedure details
  const [procedure, setProcedure] = useState("");
  // State to manage the discharge date
  const [dischargeDate, setDischargeDate] = useState("");
  // State to manage the follow-up plan
  const [followUpPlan, setFollowUpPlan] = useState("");

  // Memoize the reference to the 'clients' collection to avoid unnecessary re-renders
  const clientsCollectionRef = useMemo(() => collection(db, "clients"), []);

  // Fetch clients from Firestore when the component mounts
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getDocs(clientsCollectionRef);
        const clientsArray = data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientsArray);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, [clientsCollectionRef]);

  // Function to validate the date format
  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regex)) return false;

    const date = new Date(dateString);
    const timestamp = date.getTime();

    if (typeof timestamp !== "number" || isNaN(timestamp)) return false;

    return dateString === date.toISOString().split("T")[0];
  };

  // Document templates for different document types
  const templates = {
    deleteCustomerInfo: (client) => `
    <head>
      <style>
      .header {
        text-align: center;
      }
      .header img {
        height: 87px;
        width: 218px;
      }
      .signature-line {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }
      .signature {
        width: 50%;
      }
      .footer {
        text-align: center;
        margin-top: 50px;
        line-height: 1.6;
      }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="file:///Users/andrewchris/Desktop/MACreactlicenta/src/assets/pogany.png" alt="Header Image"/>
      </div>
      <h1>Request to Delete Customer Information</h1>
      <p>Dear Admin,</p>
      <p>I, ${client.firstName} ${client.surname}, Social Security Number: ${client.ssn}, Birthdate: ${client.birthdate} request the deletion of my information from the database.</p>
      <p>Thank you,</p>
      <div class="signature-line">
        <div class="signature">Signature of the clinic representative,</div>
        <div class="signature" style="text-align: right;">Signature of the client,</div>
      </div>
      <div class="footer">
        <p>Str. Mugur Mugurel, Nr. 4, Sector 3, Bucuresti, Romania</p>
        <p>+40 722 394 222 | +40 799 873 774</p>
        <p>office@clinicapogany.ro</p>
        <p>Monday-Friday: 09:00 – 19:00</p>
      </div>
    </body>
    `,
    hospitalizationDocument: (client) => `
    <head>
      <style>
      .header {
        text-align: center;
      }
      .header img {
        height: 87px;
        width: 218px;
      }
      .footer {
        text-align: center;
        margin-top: 50px;
        line-height: 1.6;
      }
      .signature-line {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }
      .signature {
        width: 50%;
      }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="file:///Users/andrewchris/Desktop/MACreactlicenta/src/assets/pogany.png" alt="Header Image"/>
      </div>
      <h1>Hospitalization Document</h1>
      <p>The patient ${client.firstName} ${client.surname}, Gender ${client.gender}, Birthdate ${client.birthdate}, SSN ${client.ssn}</p>
      <p>Health Problems: ${client.healthproblems}</p>
      <p>Emergency Contact Phone: ${client.emerphone}</p>
      <p>Emergency Contact Name: ${client.emername}</p>
      <p>Date of Admission: ${admissionDate}</p>
      <p>Procedure: ${procedure}</p>
      <div class="signature-line">
        <div class="signature">Signature of the clinic representative,</div>
        <div class="signature" style="text-align: right;">Signature of the client,</div>
      </div>
      <div class="footer">
        <p>Str. Mugur Mugurel, Nr. 4, Sector 3, Bucuresti, Romania</p>
        <p>+40 722 394 222 | +40 799 873 774</p>
        <p>office@clinicapogany.ro</p>
        <p>Monday-Friday: 09:00 – 19:00</p>
      </div>
    </body>
    `,
    externalizationDocument: (client) => `
    <head>
      <style>
      .header {
        text-align: center;
      }
      .header img {
        height: 87px;
        width: 218px;
      }
      .footer {
        text-align: center;
        margin-top: 50px;
        line-height: 1.6;
      }
      .signature-line {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }
      .signature {
        width: 50%;
      }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="file:///Users/andrewchris/Desktop/MACreactlicenta/src/assets/pogany.png" alt="Header Image"/>
      </div>
      <h1>Externalization from Hospital Document</h1>
      <p>The patient ${client.firstName} ${client.surname}, Gender ${client.gender}, Birthdate ${client.birthdate}, SSN ${client.ssn}</p>
      <p>Health Problems: ${client.healthproblems}</p>
      <p>Emergency Contact Phone: ${client.emerphone}</p>
      <p>Emergency Contact Name: ${client.emername}</p>
      <p>Date of Discharge: ${dischargeDate}</p>
      <p>Follow-Up Plan: ${followUpPlan}</p>
      <div class="signature-line">
        <div class="signature">Signature of the clinic representative,</div>
        <div class="signature" style="text-align: right;">Signature of the client,</div>
      </div>
      <div class="footer">
        <p>Str. Mugur Mugurel, Nr. 4, Sector 3, Bucuresti, Romania</p>
        <p>+40 722 394 222 | +40 799 873 774</p>
        <p>office@clinicapogany.ro</p>
        <p>Monday-Friday: 09:00 – 19:00</p>
      </div>
    </body>
    `,
  };

  // Function to handle exporting the document
  const handleExport = () => {
    const client = clients.find((c) => c.id === selectedClient);
    if (!client) return;

    if (
      (documentType === "hospitalizationDocument" &&
        !isValidDate(admissionDate)) ||
      (documentType === "externalizationDocument" &&
        !isValidDate(dischargeDate))
    ) {
      alert("Please enter a valid date in the format DD.MM.YYYY.");
      return;
    }

    const content = templates[documentType](client);
    const converted = htmlDocx.asBlob(content);
    saveAs(
      converted,
      `${documentType}_${client.firstName}_${client.surname}.docx`
    );
  };

  // Function to handle document type change
  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
    setSelectedClient("");
  };

  // Function to handle client selection change
  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClient(clientId);
  };

  // Render the component
  return (
    <div className="bg-white flex-grow">
      <div className="p-4">
        <div className="mb-4">
          <label htmlFor="documentType" className="block mb-2">
            Select Document Type:
          </label>
          <select
            id="documentType"
            value={documentType}
            onChange={handleDocumentTypeChange}
            className="p-2 border rounded w-full"
          >
            <option value="">-- Select Document Type --</option>
            <option value="deleteCustomerInfo">
              Delete Customer Information
            </option>
            <option value="hospitalizationDocument">
              Hospitalization Document
            </option>
            <option value="externalizationDocument">
              Externalization Document
            </option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="client" className="block mb-2">
            Select Client:
          </label>
          <select
            id="client"
            value={selectedClient}
            onChange={handleClientChange}
            className="p-2 border rounded w-full"
            disabled={!documentType}
          >
            <option value="">-- Select Client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.surname}
              </option>
            ))}
          </select>
        </div>
        {documentType === "hospitalizationDocument" && selectedClient && (
          <div className="mb-4">
            <label htmlFor="admissionDate" className="block mb-2">
              Date of Admission:
            </label>
            <input
              type="date"
              id="admissionDate"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              className="p-2 border rounded w-full mb-4"
            />
            <label htmlFor="procedure" className="block mb-2">
              Procedure:
            </label>
            <textarea
              id="procedure"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="p-2 border rounded w-full h-24 resize-none"
            ></textarea>
          </div>
        )}
        {documentType === "externalizationDocument" && selectedClient && (
          <div className="mb-4">
            <label htmlFor="dischargeDate" className="block mb-2">
              Date of Discharge:
            </label>
            <input
              type="date"
              id="dischargeDate"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
              className="p-2 border rounded w-full mb-4"
            />
            <label htmlFor="followUpPlan" className="block mb-2">
              Follow-Up Plan:
            </label>
            <textarea
              id="followUpPlan"
              value={followUpPlan}
              onChange={(e) => setFollowUpPlan(e.target.value)}
              className="p-2 border rounded w-full h-24 resize-none"
            ></textarea>
          </div>
        )}
        <button
          onClick={handleExport}
          className={`${
            !documentType || !selectedClient
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          } text-white font-bold py-2 px-4 rounded`}
          disabled={!documentType || !selectedClient}
        >
          Download
        </button>
      </div>
    </div>
  );
}
