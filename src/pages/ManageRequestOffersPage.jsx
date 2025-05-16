import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, runTransaction, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import LoanOfferCard from '../components/LoanOfferCard';
import { collectLoanOffers } from '../hooks/collectLoanOffers';
import { ArrowPathIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

const ManageRequestOffersPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [currentUser, setCurrentUser] = useState(null);
  const [loanRequest, setLoanRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOfferId, setProcessingOfferId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchRequestAndOffers = useCallback(async () => {
    if (!currentUser || !requestId) {
      setLoading(false);
      if (!currentUser && !auth.currentUser) setError("Please log in to manage offers.");
      else if(!requestId) setError("Request ID is missing.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const requestRef = doc(db, 'loanRequests', requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) {
        setError('Loan request not found.');
        setLoanRequest(null);
        setOffers([]);
        setLoading(false);
        return;
      }

      const requestData = { id: requestSnap.id, ...requestSnap.data() };

      if (requestData.borrowerId !== currentUser.uid) {
        setError('You are not authorized to manage offers for this request.');
        setLoanRequest(null);
        setOffers([]);
        setLoading(false);
        return;
      }
      setLoanRequest(requestData);

      const pendingOffers = await collectLoanOffers(requestId, currentUser.uid);
      setOffers(pendingOffers);

    } catch (err) {
      console.error("Error fetching request and offers:", err);
      setError('Failed to load details. Please try again. ' + err.message);
      setLoanRequest(null);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, requestId, db, auth]);

  useEffect(() => {
    if (currentUser) {
        fetchRequestAndOffers();
    }
  }, [currentUser, fetchRequestAndOffers]);

  const handleAcceptOfferRobust = async (offerToAccept) => {
    if (!loanRequest || loanRequest.status === 'funded') {
      setError("This loan request is already funded or cannot be processed.");
      return;
    }
    if (loanRequest.borrowerId !== currentUser?.uid) {
        setError("You are not authorized to accept offers for this request.");
        return;
    }

    setProcessingOfferId(offerToAccept.id);
    setError(null);

    try {
      await runTransaction(db, async (transaction) => {
        const loanRequestRef = doc(db, 'loanRequests', requestId);
        const acceptedOfferRef = doc(db, 'loanOffers', offerToAccept.id);

        const loanRequestSnap = await transaction.get(loanRequestRef);
        const acceptedOfferSnap = await transaction.get(acceptedOfferRef);

        if (!loanRequestSnap.exists()) throw new Error("Loan request does not exist.");
        if (!acceptedOfferSnap.exists()) throw new Error("Offer to accept does not exist.");

        const currentRequestData = loanRequestSnap.data();
        const currentOfferData = acceptedOfferSnap.data();

        if (currentRequestData.status === 'funded') throw new Error("Loan request has already been funded.");
        if (currentOfferData.status !== 'pending') throw new Error("This offer is no longer pending.");
        if (currentRequestData.borrowerId !== currentUser.uid) throw new Error("Authorization failed.");

        transaction.update(acceptedOfferRef, { status: 'accepted', updatedAt: serverTimestamp() });
        transaction.update(loanRequestRef, {
          status: 'funded',
          amountFunded: offerToAccept.amount,
          acceptedOfferId: offerToAccept.id,
          finalAPR: offerToAccept.apr,
          fundedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      const otherOffersQuery = query(
        collection(db, 'loanOffers'),
        where('loanRequestId', '==', requestId),
        where('status', '==', 'pending') 
      );
      const otherOffersSnap = await getDocs(otherOffersQuery);
      const batch = writeBatch(db);
      otherOffersSnap.forEach((offerDoc) => {
        if (offerDoc.id !== offerToAccept.id) { 
            const offerRef = doc(db, 'loanOffers', offerDoc.id);
            batch.update(offerRef, { status: 'auto-declined', updatedAt: serverTimestamp() });
        }
      });
      await batch.commit();

      alert('Offer accepted successfully! The loan is now funded.');
      fetchRequestAndOffers();
    } catch (err) {
      console.error("Error accepting offer (robust):", err);
      setError(`Failed to accept offer: ${err.message}`);
      alert(`Failed to accept offer: ${err.message}`);
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleDeclineOffer = async (offerIdToDecline) => {
    if (loanRequest?.borrowerId !== currentUser?.uid) {
        setError("You are not authorized to decline offers for this request.");
        return;
    }
    setProcessingOfferId(offerIdToDecline);
    setError(null);
    try {
      const offerRef = doc(db, 'loanOffers', offerIdToDecline);
      await runTransaction(db, async (transaction) => {
          const offerSnap = await transaction.get(offerRef);
          if (!offerSnap.exists()) throw new Error("Offer not found.");
          if (offerSnap.data().status !== 'pending') throw new Error ("Offer is not pending.");
          transaction.update(offerRef, { 
              status: 'declined',
              updatedAt: serverTimestamp()
          });
      });
      
      alert('Offer declined.');
      fetchRequestAndOffers();
    } catch (err) {
      console.error("Error declining offer:", err);
      setError(`Failed to decline offer: ${err.message}`);
      alert(`Failed to decline offer: ${err.message}`);
    } finally {
      setProcessingOfferId(null);
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="mt-3 text-xl text-slate-700">Loading User...</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="mt-3 text-xl text-slate-700">Loading Request & Offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
        <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!loanRequest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
        <InformationCircleIcon className="h-16 w-16 text-slate-500 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Request Not Found</h2>
        <p className="text-slate-600 mb-6">The loan request you are looking for could not be loaded or you may not have access.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }
  
  const isRequestFunded = loanRequest.status === 'funded';

  // Filter offers into categories for display (optional, but can be useful for UI)
  const pendingOffers = offers.filter(offer => offer.status === 'pending');
  const acceptedOffer = offers.find(offer => offer.status === 'accepted'); // Should be only one
  const otherOffers = offers.filter(offer => offer.status !== 'pending' && offer.status !== 'accepted'); // declined, auto-declined

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-12">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl mb-3">
          Manage Offers for: {loanRequest.title}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-600 mb-4">
          <p><span className="font-semibold text-slate-700">Amount Requested:</span> {formatCurrency(loanRequest.amount)}</p>
          <p><span className="font-semibold text-slate-700">Max APR:</span> {loanRequest.maxAPR}%</p>
          <p><span className="font-semibold text-slate-700">Term:</span> {loanRequest.term} months</p>
          <p><span className="font-semibold text-slate-700">Status:</span> 
            <span className={`font-bold px-2 py-0.5 rounded-full text-xs ml-1 ${
              isRequestFunded ? 'bg-green-100 text-green-700' :
              loanRequest.status === 'seekingFunds' ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {loanRequest.status.charAt(0).toUpperCase() + loanRequest.status.slice(1)}
            </span>
          </p>
          {isRequestFunded && loanRequest.acceptedOfferId && (
            <p className="lg:col-span-2"><span className="font-semibold text-slate-700">Amount Funded:</span> {formatCurrency(loanRequest.amountFunded)} at {loanRequest.finalAPR}% APR</p>
          )}
        </div>
        <div className="prose prose-slate max-w-none">
            <h3 className="text-md font-semibold text-slate-700">Story:</h3>
            <p className="text-sm text-slate-600">{loanRequest.story}</p>
        </div>

        {isRequestFunded && (
          <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
            <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-700">This loan request is now funded!</h3>
            <p className="text-sm text-green-600">
              Offer ID: {loanRequest.acceptedOfferId} was accepted.
            </p>
          </div>
        )}
      </div>

      {/* Loan Offers Section - REVISED to show all offers, grouped or styled by status by LoanOfferCard */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-700 mb-6">
          {offers.length > 0 ? 'Loan Offers Received' : 'No Offers Received Yet'}
        </h2>
        {offers.length > 0 ? (
          <div className="space-y-6">
            {/* Display Accepted Offer First if present and request is funded */}
            {isRequestFunded && acceptedOffer && (
                 <div className="mb-8">
                    <h3 className="text-xl font-medium text-green-600 mb-3">Accepted Offer</h3>
                    <LoanOfferCard
                        key={acceptedOffer.id}
                        offer={acceptedOffer}
                        onAccept={() => handleAcceptOfferRobust(acceptedOffer)} // Will be disabled internally by card
                        onDecline={() => handleDeclineOffer(acceptedOffer.id)} // Will be disabled internally by card
                        isProcessing={processingOfferId === acceptedOffer.id}
                        isRequestFunded={isRequestFunded}
                        currentUserId={currentUser?.uid}
                    />
                </div>
            )}

            {/* Display Pending Offers if request is NOT YET funded */}
            {!isRequestFunded && pendingOffers.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-medium text-yellow-600 mb-3">Pending Offers ({pendingOffers.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingOffers.map((offer) => (
                            <LoanOfferCard
                            key={offer.id}
                            offer={offer}
                            onAccept={() => handleAcceptOfferRobust(offer)}
                            onDecline={() => handleDeclineOffer(offer.id)}
                            isProcessing={processingOfferId === offer.id}
                            isRequestFunded={isRequestFunded}
                            currentUserId={currentUser?.uid}
                            />
                        ))}
                    </div>
                </div>
            )}
            {!isRequestFunded && pendingOffers.length === 0 && !isRequestFunded && (
                 <p className="text-slate-500 mb-8">There are currently no pending offers for this loan request.</p>
            )}

            {/* Display Other Offers (declined, auto-declined) */}
            {otherOffers.length > 0 && (
                 <div>
                    <h3 className="text-xl font-medium text-slate-500 mb-3">Other Offers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                        {otherOffers.map((offer) => (
                            <LoanOfferCard
                            key={offer.id}
                            offer={offer}
                            onAccept={() => handleAcceptOfferRobust(offer)} // Should be disabled by card logic
                            onDecline={() => handleDeclineOffer(offer.id)} // Should be disabled by card logic
                            isProcessing={processingOfferId === offer.id} 
                            isRequestFunded={isRequestFunded}
                            currentUserId={currentUser?.uid}
                            />
                        ))}
                    </div>
                </div>
            )}
          </div>
        ) : (
          // This message is shown if offers array is completely empty initially
          <p className="text-slate-500">No offers have been made for this loan request yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageRequestOffersPage; 