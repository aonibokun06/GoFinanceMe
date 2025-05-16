// MyRequests.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MyRequestCard from './MyRequestCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      if (!auth.currentUser) {
        setError('User not authenticated.');
        setLoading(false);
        setRequests([]); // Clear requests if user is not authenticated
        return;
      }

      try {
        const q = query(
          collection(db, 'requests'),
          where('borrowerId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedRequests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRequests(fetchedRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError('Failed to fetch requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to auth state changes to refetch if user logs in/out
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchRequests();
      } else {
        setRequests([]);
        setLoading(false);
        setError('Please log in to see your requests.');
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [auth, db]); // db is stable, auth object itself is stable. Effect reacts to auth state changes.

  const filteredRequests = useMemo(() => {
    if (!searchTerm) {
      return requests;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return requests.filter(request => {
      const titleMatch = request.title?.toLowerCase().includes(lowerSearchTerm);
      // Assuming request.tags is an array of strings
      const tagsMatch = Array.isArray(request.tags) && request.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm));
      const amountMatch = request.amount?.toString().toLowerCase().includes(lowerSearchTerm);
      // Assuming APR might be stored as request.apr or request.maxAPR
      const aprMatch = request.apr?.toString().toLowerCase().includes(lowerSearchTerm) || request.maxAPR?.toString().toLowerCase().includes(lowerSearchTerm);
      
      return titleMatch || tagsMatch || amountMatch || aprMatch;
    });
  }, [requests, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
            My Loan Requests
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            View, manage, and track the status of your loan requests.
          </p>
        </header>

        <div className="mb-8">
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="searchRequests"
              id="searchRequests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-colors"
              placeholder="Search by title, tags, amount, or APR..."
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading your requests...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md bg-red-50 p-4 text-center">
            <h3 className="text-sm font-medium text-red-800">Oops! Something went wrong.</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21m-12 6.75v.75A.75.75 0 019 12h-.75m0 0v-.75A.75.75 0 019 10.5h.75m0 0h.008v.008H9.75v-.008zm0 0H21m-6.75N.75A.75.75 0 016 6h-.75m0 0v-.75A.75.75 0 016 4.5h.75m0 0H21" />
            </svg>
            <h3 className="mt-2 text-lg font-semibold text-slate-800">No requests found</h3>
            <p className="mt-1 text-sm text-slate-600">You haven't created any loan requests yet.</p>
            {/* Optional: Add a button to create a new request */}
            {/* <button type="button" className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Create New Request</button> */}
          </div>
        )}

        {!loading && !error && requests.length > 0 && filteredRequests.length === 0 && (
           <div className="text-center py-10">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-semibold text-slate-800">No matching requests</h3>
            <p className="mt-1 text-sm text-slate-600">Try adjusting your search term.</p>
          </div>
        )}

        {!loading && !error && filteredRequests.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRequests.map((request) => (
              <MyRequestCard key={request.id} request={request} />
              /* Assuming onFund prop for MyRequestCard is not needed here or handled internally */
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;