// AllRequests.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { getFirestore, collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import RequestCard from './RequestCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const db = getFirestore();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, 'loanRequests'));
        const requestsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Ensure all necessary fields for display and filtering are present
          return {
            id: doc.id,
            title: data.title || 'Untitled Request', // Ensure title exists
            tags: data.tags || [], // Ensure tags is an array
            amount: data.amount || 0,
            maxAPR: data.maxAPR || data.apr || 0, // Check for apr as well
            term: data.term || 0,
            fundedSoFar: data.fundedSoFar || 0,
            story: data.story || '', // For potential display in card or expanded view
            borrowerId: data.borrowerId || null, // Keep borrowerId if needed
            // Add other relevant fields that RequestCard might need
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

  const handleFund = async (requestId, amountToFund) => {
    // Note: amountToFund needs to be determined, perhaps via a modal in RequestCard
    if (!amountToFund || isNaN(parseFloat(amountToFund)) || parseFloat(amountToFund) <= 0) {
      setError("Please enter a valid amount to fund.");
      return;
    }
    const numericAmountToFund = parseFloat(amountToFund);

    try {
      setError(null); // Clear previous errors
      const requestRef = doc(db, "requests", requestId);

      await runTransaction(db, async (transaction) => {
        const requestDoc = await transaction.get(requestRef);
        if (!requestDoc.exists()) {
          throw new Error("Request does not exist!");
        }

        const requestData = requestDoc.data();
        const newFundedSoFar = (requestData.fundedSoFar || 0) + numericAmountToFund;

        if (newFundedSoFar > requestData.amount) {
          throw new Error("Funding amount exceeds remaining amount needed.");
        }

        transaction.update(requestRef, { fundedSoFar: newFundedSoFar });

        // Update local state optimistically or refetch for consistency
        setRequests(prevRequests =>
          prevRequests.map(req =>
            req.id === requestId
              ? { ...req, fundedSoFar: newFundedSoFar }
              : req
          )
        );
      });

      console.log("Funding successful for request:", requestId, "with amount:", numericAmountToFund);
      // Optionally, provide success feedback to the user
    } catch (error) {
      console.error("Error funding request:", error.message);
      setError(error.message); // Display funding-specific errors
    }
  };

  const filteredRequests = useMemo(() => {
    if (!searchTerm) {
      return requests;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return requests.filter(request => {
      const titleMatch = request.title?.toLowerCase().includes(lowerSearchTerm);
      const tagsMatch = Array.isArray(request.tags) && request.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm));
      const amountMatch = request.amount?.toString().toLowerCase().includes(lowerSearchTerm);
      const aprMatch = request.maxAPR?.toString().toLowerCase().includes(lowerSearchTerm);
      // Add other fields to search if necessary, e.g., story snippets
      // const storyMatch = request.story?.toLowerCase().includes(lowerSearchTerm);

      return titleMatch || tagsMatch || amountMatch || aprMatch; // || storyMatch;
    });
  }, [requests, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
            Join our community in supporting one another          </h1>
          <p className="mt-3 text-lg text-slate-600">


            Browse loan requests from fellow members and help them reach their goals.
          </p>
        </header>

        <div className="mb-8">
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="searchAllRequests"
              id="searchAllRequests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-colors"
              placeholder="Search by title, tags, amount, or APR..."
            />
          </div>
        </div>

        {/* Display general errors related to fetching or major funding issues */}
        {error && !loading && (
          <div className="rounded-md bg-red-50 p-4 mb-6 text-center">
            <h3 className="text-sm font-medium text-red-800">An Error Occurred</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading requests...</p>
          </div>
        )}

        {!loading && requests.length === 0 && !error && (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237a25.48 25.48 0 004.358-4.358c.22-.22.167-.583-.108-.727a1.846 1.846 0 00-2.966-.016c-.09.09-.16.19-.22.29a24.138 24.138 0 00-2.837 3.499c-.04.07-.09.13-.15.19h-.001c-.68.68-1.84 1.035-3.06 1.035-1.22 0-2.377-.355-3.06-1.035a2.5 2.5 0 01-.196-.234c-.07-.09-.14-.19-.22-.29a1.846 1.846 0 00-2.966.017c-.275.144-.328.507-.108.727C3.29 9.04 4.875 10.875 6.875 12c1.006.562 2.087.938 3.25 1.125V18.75m0 0c1.313 0 2.5-.438 3.438-1.125C16.453 15.938 18 13.938 18 11.25c0-2.059-.968-3.89-2.438-5.156a1.846 1.846 0 00-2.966-.016c-.09.09-.16.19-.22.29a24.138 24.138 0 00-2.837 3.499c-.04.07-.09.13-.15.19h-.001c-.68.68-1.84 1.035-3.06 1.035-1.22 0-2.377-.355-3.06-1.035A2.5 2.5 0 013.43 8.1c-.07-.09-.14-.19-.22-.29a1.846 1.846 0 00-2.966.017c-.275.144-.328.507-.108.727C1.547 9.04 3.125 10.875 5.125 12c1.006.562 2.087.938 3.25 1.125V18.75" />
            </svg>
            <h3 className="mt-2 text-lg font-semibold text-slate-800">No funding requests available</h3>
            <p className="mt-1 text-sm text-slate-600">Check back later to see new opportunities.</p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && filteredRequests.length === 0 && (
          <div className="text-center py-10">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-semibold text-slate-800">No requests match your search</h3>
            <p className="mt-1 text-sm text-slate-600">Try a different search term or clear your search.</p>
          </div>
        )}

        {!loading && !error && filteredRequests.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} onFund={handleFund} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRequests;