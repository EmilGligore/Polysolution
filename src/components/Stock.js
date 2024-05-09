import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

export default function Stock() {
  const stockCollectionRef = collection(db, "stock");
  const [stock, setStock] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const getStock = async () => {
      const data = await getDocs(stockCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        isEditable: false,
      }));
      filteredData.sort((a, b) => a.quantity - b.quantity);
      setStock(filteredData);
    };
    getStock();
  }, []);

  const addNewStock = () => {
    const newStock = {
      name: "",
      quantity: 0,
      isEditable: true,
    };
    setStock([...stock, newStock]);
  };

  const handleInputChange = (id, field, value) => {
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
        console.log("Document successfully updated!");
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
        setStock((prevStock) => [
          ...prevStock.filter(
            (stockItem) =>
              stockItem.id !== undefined && stockItem.isEditable === false
          ),
          { ...item, id: docRef.id, isEditable: false },
        ]);
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
        if (item.isEditable) {
          updateFirestoreItem(id, item);
        }
        return { ...item, isEditable: !item.isEditable };
      }
      return item;
    });
    setStock(updatedStock);
  };

  return (
    <div className="bg-white flex-grow">
      <div className="flex justify-between items-center h-12 border-b border-gray-200">
        <div className="text-lg font-bold ml-2 h-12 flex justify-between items-center">
          Stock
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-2 h-12">Item</th>
            <th className="text-left p-2 h-12">Quantity</th>
            <th className="text-right p-2 h-12">
              <button
                onClick={addNewStock}
                className="bg-blue-500 hover:bg-blue-700 rounded py-1 px-4 font-normal w-[148px]"
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
              className="border-b h-12"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <td className="p-2">
                <input
                  type="text"
                  value={item.name}
                  readOnly={!item.isEditable}
                  onChange={(e) =>
                    handleInputChange(item.id, "name", e.target.value)
                  }
                  className="bg-transparent"
                  placeholder="Item..."
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={item.quantity}
                  readOnly={!item.isEditable}
                  onChange={(e) =>
                    handleInputChange(item.id, "quantity", e.target.value)
                  }
                  className="bg-transparent w-full"
                  placeholder="Quantity..."
                />
              </td>
              <td className="flex justify-end items-center">
                <div
                  className={`flex ${hoveredId === item.id ? "" : "hidden"}`}
                >
                  <button
                    onClick={() => toggleEdit(item.id)}
                    className={`${
                      item.isEditable ? "bg-blue-500" : "bg-blue-500"
                    } hover:bg-blue-700 py-1 px-4 m-1 rounded`}
                    style={{ width: "70px" }}
                  >
                    {item.isEditable ? "Save" : "Edit"}
                  </button>
                  <button
                    onClick={() => deleteStockItem(item.id)}
                    className="bg-blue-500 hover:bg-blue-700 py-1 m-1 mr-2 rounded"
                    style={{ width: "70px" }}
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
