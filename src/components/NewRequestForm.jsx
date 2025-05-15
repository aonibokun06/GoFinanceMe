// NewRequestForm.jsx
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; // Ensure auth is imported

const NewRequestForm = () => {
  const [formData, setFormData] = useState({ amount: "", maxAPR: "", term: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser; // Get the currently authenticated user
      if (!user) {
        alert("You must be logged in to create a request.");
        return;
      }

      await addDoc(collection(db, "requests"), {
        ...formData,
        fundedSoFar: 0,
        createdAt: new Date(),
        repaid: false,
        borrowerId: user.uid, // Add the borrower's user ID
      });

      alert("Request created successfully!");
      setFormData({ amount: "", maxAPR: "", term: "" });
    } catch (error) {
      console.error("Error adding document: ", error.message);
    }
  };

  return (
    <>
      <h1 className='text-black text-[60px] text-center'>Make New Request</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4 items-center">
      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        className="border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Max APR (%)"
        value={formData.maxAPR}
        onChange={(e) => setFormData({ ...formData, maxAPR: e.target.value })}
        className="border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Term (months)"
        value={formData.term}
        onChange={(e) => setFormData({ ...formData, term: e.target.value })}
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Create Request
      </button>
    </form>
    </>
   
  );
};

export default NewRequestForm;