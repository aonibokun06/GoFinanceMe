// MyRequests.jsx
import React, { useEffect, useState, useRef } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MyRequestCard from './MyRequestCard';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const hasFetched = useRef(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchRequests = async () => {
      if (hasFetched.current) {
        return; // Prevent fetching again
      } 
      hasFetched.current = true; // Mark as fetched

      const q = query(
        collection(db, 'requests'),
        where('borrowerId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      setRequests(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      console.log("fetched");
    };
    fetchRequests();
  }, [auth, db]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((request) => (
        <MyRequestCard key={request.id} request={request} onFund={() => {}} />
      ))}
    </div>
  );
};

export default MyRequests;