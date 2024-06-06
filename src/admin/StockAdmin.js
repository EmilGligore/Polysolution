import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebase";
import {
  getDocs,
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

export default function Stock() {
  const stockCollectionRef = useMemo(() => collection(db, "stock"), []);
  const [stock, setStock] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const getStock = async () => {
      const data = await getDocs(stockCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        isEditable: false,
        isEdited: false,
      }));
      filteredData.sort((a, b) => a.quantity - b.quantity);
      setStock(filteredData);
    };
    getStock();
  }, [stockCollectionRef]);

  const addNewStock = () => {
    const newStock = {
      name: "",
      quantity: 0,
      isEditable: true,
      isEdited: true,
    };
    setStock([...stock, newStock]);
  };

  const handleInputChange = (id, field, value) => {
    const lettersOnly = /^[A-Za-z\s]*$/;
    const numbersOnly = /^\d*$/;

    if (field === "name" && !lettersOnly.test(value)) {
      alert("Only letters are allowed for Item Name.");
      return;
    }

    if (field === "quantity" && !numbersOnly.test(value)) {
      alert("Only numbers are allowed for Quantity.");
      return;
    }

    const updatedStock = stock.map((item) => {
      if (item.id === id || item === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setStock(updatedStock);
  };

  const updateFirestoreItem = async (id, item) => {
    if (id) {
      const itemDocRef = doc(db, "stock", id);
      try {
        await updateDoc(itemDocRef, {
          name: item.name,
          quantity: item.quantity,
        });
        console.log("Document updated with ID:", id);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    } else {
      try {
        const docRef = await addDoc(stockCollectionRef, {
          name: item.name,
          quantity: item.quantity,
        });
        console.log("New document added with ID:", docRef.id);
        setStock((prevStock) =>
          prevStock.map((stockItem) =>
            stockItem === item
              ? { ...item, id: docRef.id, isEditable: false, isEdited: false }
              : stockItem
          )
        );
      } catch (error) {
        console.error("Error adding new document: ", error);
      }
    }
  };

  const deleteStockItem = async (id) => {
    const itemDocRef = doc(db, "stock", id);
    try {
      await deleteDoc(itemDocRef);
      setStock(stock.filter((item) => item.id !== id));
      console.log("Document successfully deleted!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const toggleEdit = (id) => {
    const updatedStock = stock.map((item) => {
      if (item.id === id) {
        return { ...item, isEditable: true, isEdited: true };
      }
      return item;
    });
    setStock(updatedStock);
  };

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

  return (
    <div className="bg-white flex-grow overflow-auto p-4 rounded shadow-md">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-gray-200">
        <th className="text-left p-4 h-12 font-semibold text-gray-700">Item</th>
        <th className="text-left p-4 h-12 font-semibold text-gray-700">Quantity</th>
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
          <td className="p-4">
            <input
              type="text"
              value={item.name}
              readOnly={!item.isEditable}
              onChange={(e) =>
                handleInputChange(item.id, "name", e.target.value)
              }
              className="bg-transparent w-full border-b border-dashed border-gray-400 focus:outline-none"
              placeholder="Item..."
            />
          </td>
          <td className="p-4">
            <input
              type="number"
              value={item.quantity}
              readOnly={!item.isEditable}
              onChange={(e) =>
                handleInputChange(item.id, "quantity", e.target.value)
              }
              className="bg-transparent w-full border-b border-dashed border-gray-400 focus:outline-none"
              placeholder="Quantity..."
            />
          </td>
          <td className="flex justify-end items-center p-4">
            <div
              className={`flex space-x-2 ${
                hoveredId === item.id ? "" : "hidden"
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
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
}
