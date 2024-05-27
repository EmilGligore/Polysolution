import React, { useState, useEffect, useMemo } from 'react';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DocExport() {
  const [documentType, setDocumentType] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  const clientsCollectionRef = useMemo(() => collection(db, 'clients'), []);

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
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, [clientsCollectionRef]);

  const templates = {
    deleteCustomerInfo: (client) => `
      <h1>Request to Delete Customer Information</h1>
      <p>Dear [Customer Service],</p>
      <p>I am writing to request the deletion of my personal information from your records.</p>
      <p>Thank you,</p>
      <p>${client.firstName} ${client.surname}</p>
      <p>Social Security Number: ${client.ssn}</p>
      <p>Phone: ${client.phone}</p>
      <p>Email: ${client.email}</p>
      <p>Birthdate: ${client.birthdate}</p>
      <p>Gender: ${client.gender}</p>
      <p>Health Problems: ${client.healthproblems}</p>
      <p>Emergency Contact Phone: ${client.emerphone}</p>
      <p>Emergency Contact Name: ${client.emername}</p>
    `,
    hospitalizationDocument: (client) => `
      <h1>Hospitalization Document</h1>
      <p>Patient Name: ${client.firstName} ${client.surname}</p>
      <p>Date of Admission: [Date]</p>
      <p>Diagnosis: [Diagnosis]</p>
      <p>Treatment Plan: [Treatment Plan]</p>
      <p>Social Security Number: ${client.ssn}</p>
      <p>Phone: ${client.phone}</p>
      <p>Email: ${client.email}</p>
      <p>Birthdate: ${client.birthdate}</p>
      <p>Gender: ${client.gender}</p>
      <p>Health Problems: ${client.healthproblems}</p>
      <p>Emergency Contact Phone: ${client.emerphone}</p>
      <p>Emergency Contact Name: ${client.emername}</p>
    `,
    externalizationDocument: (client) => `
      <h1>Externalization from Hospital Document</h1>
      <p>Patient Name: ${client.firstName} ${client.surname}</p>
      <p>Date of Discharge: [Date]</p>
      <p>Condition: [Condition]</p>
      <p>Follow-Up Plan: [Follow-Up Plan]</p>
      <p>Social Security Number: ${client.ssn}</p>
      <p>Phone: ${client.phone}</p>
      <p>Email: ${client.email}</p>
      <p>Birthdate: ${client.birthdate}</p>
      <p>Gender: ${client.gender}</p>
      <p>Health Problems: ${client.healthproblems}</p>
      <p>Emergency Contact Phone: ${client.emerphone}</p>
      <p>Emergency Contact Name: ${client.emername}</p>
    `,
  };

  const handleExport = () => {
    const client = clients.find((c) => c.id === selectedClient);
    if (!client) return;

    const content = templates[documentType](client);
    const converted = htmlDocx.asBlob(content);
    saveAs(converted, `${documentType}.docx`);
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
    setHtmlContent('');
    setSelectedClient('');
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClient(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setHtmlContent(templates[documentType](client));
    } else {
      setHtmlContent('');
    }
  };

  return (
    <div className="bg-white flex-grow">
      <div className="flex justify-between items-center h-12 border-b border-gray-200">
        <div className="text-lg font-bold ml-2 h-12 flex justify-between items-center">
          Export Document
        </div>
      </div>
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
            <option value="deleteCustomerInfo">Delete Customer Information</option>
            <option value="hospitalizationDocument">Hospitalization Document</option>
            <option value="externalizationDocument">Externalization Document</option>
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
        <div className="mb-4">
          <textarea
            id="htmlContent"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="p-2 border rounded w-full h-64"
            readOnly
          ></textarea>
        </div>
        <button
          onClick={handleExport}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!documentType || !selectedClient}
        >
          Download
        </button>
      </div>
    </div>
  );
}
