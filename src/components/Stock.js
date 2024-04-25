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

  useEffect(() => {
    const getStock = async () => {
      const data = await getDocs(stockCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        isEditable: false,
      }));
      setStock(filteredData);
    };
    getStock();
  }, []);

  const addNewStock = () => {
    const newStock = {
      name: "",
      quantity: 0,
      isEditable: true, // Ensure new stock is editable
    };
    setStock([...stock, newStock]);
  };

  const handleInputChange = (id, field, value) => {
    const updatedStock = stock.map((item) => {
      if (item.id === id || item === id) {
        // Ensure the new item without an ID can still be modified
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
        // Update the item with the new ID
        setStock(
          stock.map((stockItem) => {
            if (stockItem === item) {
              return { ...stockItem, id: docRef.id, isEditable: false };
            }
            return stockItem;
          })
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
    <>
      <div>Item Quantity</div>
      <button onClick={addNewStock} className="h-1/4">
        +
      </button>
      {stock.map((item, index) => (
        <div key={item.id || index} className="h-1/4">
          <input
            type="text"
            value={item.name}
            readOnly={!item.isEditable}
            onChange={(e) => handleInputChange(item.id, "name", e.target.value)}
          />
          <input
            type="number"
            value={item.quantity}
            readOnly={!item.isEditable}
            onChange={(e) =>
              handleInputChange(item.id, "quantity", e.target.value)
            }
          />
          <button onClick={() => toggleEdit(item.id)}>
            {item.isEditable ? "Save" : "Edit"}
          </button>
          <button onClick={() => deleteStockItem(item.id)}>Delete</button>
        </div>
      ))}
    </>
  );
}
