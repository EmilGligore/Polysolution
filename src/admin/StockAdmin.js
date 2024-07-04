import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebase";
import {
  getDocs,
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default function Stock() {
  // Define a memoized reference to the Firestore collection "stock"
  const stockCollectionRef = useMemo(() => collection(db, "stock"), []);

  // Define state variables to manage the stock items and the currently hovered item ID
  const [stock, setStock] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  // useEffect hook to fetch stock data from Firestore when the component mounts
  useEffect(() => {
    const getStock = async () => {
      // Fetch the documents from the Firestore collection
      const data = await getDocs(stockCollectionRef);
      // Process and format the fetched data
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        isEditable: false,
        isEdited: false,
      }));
      // Sort the stock items by quantity
      filteredData.sort((a, b) => a.quantity - b.quantity);
      // Update the state with the fetched data
      setStock(filteredData);
    };
    getStock();
  }, [stockCollectionRef]);

  // Function to add a new stock item locally (not yet saved to Firestore)
  const addNewStock = () => {
    const newStock = {
      id: `temp-${Date.now()}`, // Assign a temporary unique ID
      name: "",
      quantity: 0,
      isEditable: true,
      isEdited: true,
    };
    // Update the state to include the new stock item
    setStock([...stock, newStock]);
  };

  // Function to handle changes in input fields
  const handleInputChange = (id, field, value) => {
    const lettersOnly = /^[A-Za-z\s]*$/; // Regex for letters only
    const numbersOnly = /^\d*$/; // Regex for numbers only

    // Validate input for the "name" field
    if (field === "name" && !lettersOnly.test(value)) {
      alert("Only letters are allowed for Item Name.");
      return;
    }

    // Validate input for the "quantity" field
    if (field === "quantity" && !numbersOnly.test(value)) {
      alert("Only numbers are allowed for Quantity.");
      return;
    }

    // Update the stock item in the state
    const updatedStock = stock.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setStock(updatedStock);
  };

  // Function to update a stock item in Firestore
  const updateFirestoreItem = async (id, item) => {
    if (id.startsWith("temp-")) {
      try {
        // Add a new document to Firestore
        const docRef = await addDoc(stockCollectionRef, {
          name: item.name,
          quantity: item.quantity,
        });
        console.log("New document added with ID:", docRef.id);
        // Update the state with the new document ID
        setStock((prevStock) =>
          prevStock.map((stockItem) =>
            stockItem.id === id
              ? { ...item, id: docRef.id, isEditable: false, isEdited: false }
              : stockItem
          )
        );
      } catch (error) {
        console.error("Error adding new document: ", error);
      }
    } else {
      const itemDocRef = doc(db, "stock", id);
      try {
        // Update the existing document in Firestore
        await updateDoc(itemDocRef, {
          name: item.name,
          quantity: item.quantity,
        });
        console.log("Document updated with ID:", id);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  // Function to delete a stock item from Firestore
  const deleteStockItem = async (id) => {
    const itemDocRef = doc(db, "stock", id);
    try {
      // Delete the document from Firestore
      await deleteDoc(itemDocRef);
      // Update the state to remove the deleted item
      setStock(stock.filter((item) => item.id !== id));
      console.log("Document successfully deleted!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // Function to toggle edit mode for a stock item
  const toggleEdit = (id) => {
    const updatedStock = stock.map((item) => {
      if (item.id === id) {
        return { ...item, isEditable: true, isEdited: true };
      }
      return item;
    });
    setStock(updatedStock);
  };

  // Function to save changes to a stock item
  const handleSave = (id) => {
    const updatedStock = stock.map((item) => {
      if (item.id === id) {
        updateFirestoreItem(id, item);
        return { ...item, isEditable: false, isEdited: false };
      }
      return item;
    });
    setStock(updatedStock);
  };

  // JSX to render the stock management table
  return (
    <div className="bg-white flex-grow overflow-auto p-4 rounded shadow-md">
      <style>
        {`
    .hover-buttons {
      right: 16px;
    }
    .hover-buttons button {
      margin-left: 4px;
    }
    .hover-container {
      position: relative;
      width: 100%;
    }
    .bg-transparent input {
      border: none;
    }
  `}
      </style>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-4 h-12 font-semibold text-gray-700">
              Item
            </th>
            <th className="text-left p-4 h-12 font-semibold text-gray-700">
              Quantity
            </th>
            <th className="text-right p-4 h-12">
              <button
                onClick={addNewStock}
                className="bg-blue-500 hover:bg-blue-700 rounded py-2 px-6 font-semibold text-white"
              >
                + Add
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item, index) => (
            <tr
              key={item.id || index}
              className="border-b border-gray-200 h-12 hover:bg-gray-100"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <td className="p-4 w-1/3">
                <input
                  type="text"
                  value={item.name}
                  readOnly={!item.isEditable}
                  onChange={(e) =>
                    handleInputChange(item.id, "name", e.target.value)
                  }
                  className="bg-transparent w-full focus:outline-none"
                  placeholder="Item..."
                />
              </td>
              <td className="p-4 w-1/3">
                <input
                  type="number"
                  value={item.quantity}
                  readOnly={!item.isEditable}
                  onChange={(e) =>
                    handleInputChange(item.id, "quantity", e.target.value)
                  }
                  className="bg-transparent w-full focus:outline-none"
                  placeholder="Quantity..."
                />
              </td>
              <td className="p-4 w-1/3 relative">
                <div className="hover-container">
                  <div
                    className={`hover-buttons ${
                      hoveredId === item.id ? "flex" : "hidden"
                    }`}
                  >
                    <button
                      onClick={() => toggleEdit(item.id)}
                      className={`${
                        item.isEdited
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-700"
                      } py-1 px-4 rounded text-white`}
                      disabled={item.isEdited}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSave(item.id)}
                      className={`${
                        item.isEditable
                          ? "bg-green-500 hover:bg-green-700"
                          : "bg-gray-400 cursor-not-allowed"
                      } py-1 px-4 rounded text-white`}
                      disabled={!item.isEditable}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => deleteStockItem(item.id)}
                      className={`${
                        item.isEdited
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-700"
                      } py-1 px-4 rounded text-white`}
                      disabled={item.isEdited}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
