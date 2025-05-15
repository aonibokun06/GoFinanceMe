// AllRequests.jsx
import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import RequestCard from './RequestCard';
import { doc, runTransaction } from "firebase/firestore";

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const querySnapshot = await getDocs(collection(db, 'requests'));
        const requestsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount || 0,
            maxAPR: data.maxAPR || 0,
            term: data.term || 0,
            fundedSoFar: data.fundedSoFar || 0
          };
        });
        setRequests(requestsData);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [db]);

  const handleFund = async (requestId) => {
    try {
      setError(null);
      const requestRef = doc(db, "requests", requestId);
    
      await runTransaction(db, async (transaction) => {
        const requestDoc = await transaction.get(requestRef);
        if (!requestDoc.exists()) {
          throw new Error("Request does not exist!");
        }
    
        const requestData = requestDoc.data();
        const newFundedSoFar = (requestData.fundedSoFar || 0) + 100; // Example: Add $100 to funding
    
        if (newFundedSoFar > requestData.amount) {
          throw new Error("Cannot overfund the request!");
        }
    
        transaction.update(requestRef, { fundedSoFar: newFundedSoFar });

        // Update local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === requestId 
              ? { ...req, fundedSoFar: newFundedSoFar }
              : req
          )
        );
      });
    
      console.log("Funding successful!");
    } catch (error) {
      console.error("Error funding request:", error.message);
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading requests...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (requests.length === 0) {
    return <div className="text-center py-4">No funding requests available.</div>;
  }

  return (
    <div className="p-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} onFund={handleFund} />
        ))}
      </div>
    </div>
  );
};

export default AllRequests;