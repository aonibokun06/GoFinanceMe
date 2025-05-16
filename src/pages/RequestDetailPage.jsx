import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import {
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ClockIcon,
  UserCircleIcon,
  TagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid'; // For potential borrower rating
import OfferModal from '../components/ui/OfferModal'; // Import OfferModal
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'; // Added Firestore imports
import { getAuth } from 'firebase/auth'; // Added Auth import

/**
 * RequestDetailPage
 * (path: /requests/:requestId )
 */

// Re-using PieChart and formatCurrency from DashboardPage or define locally if not shared
// For simplicity, defining them here. In a real app, share them from a utils/components directory.
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const PieChart = ({ percentage, size = 100, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="#e5e7eb" fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#10b981" // emerald-500 for funded part
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-emerald-600">{`${percentage.toFixed(0)}%`}</span>
        <span className="text-xs text-slate-500">Funded</span>
      </div>
    </div>
  );
};

const RequestDetailPage = () => { // Removed requestId from props
  const { requestId } = useParams(); // Get requestId using useParams
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false); // State for modal visibility
  const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' }); // State for submission feedback

  // useEffect to fetch request details (modified to use Firestore)
  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const fetchRequestDetails = async () => {
      try {
        const db = getFirestore();
        const reqDocRef = doc(db, 'loanRequests', requestId);
        const docSnap = await getDoc(reqDocRef);

        if (docSnap.exists()) {
          setRequestDetails({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Request not found.');
          setRequestDetails(null); // Clear any old details
        }
      } catch (err) {
        console.error("Error fetching request details:", err);
        setError('Failed to load request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const handleOfferSubmit = async (offerData) => {
    setSubmissionStatus({ type: '', message: '' }); // Clear previous status
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSubmissionStatus({ type: 'error', message: 'You must be logged in to make an offer.' });
      // Potentially close modal or let user log in then try again
      // setIsOfferModalOpen(false); // Or keep modal open to show error inside?
      return Promise.reject(new Error('User not logged in')); // Reject to allow modal to handle its loading state
    }

    if (!requestDetails || !requestDetails.id || !requestDetails.borrowerId) {
      setSubmissionStatus({ type: 'error', message: 'Request details are incomplete or borrower information is missing.' });
      return Promise.reject(new Error('Request details incomplete'));
    }

    const newLoanOffer = {
      loanRequestId: requestDetails.id,
      borrowerId: requestDetails.borrowerId, // Assuming this field exists from your loanRequests structure
      lenderId: currentUser.uid,
      lenderName: currentUser.displayName || 'Anonymous Lender',
      lenderPhotoURL: currentUser.photoURL || '',
      amount: offerData.amount,
      apr: offerData.apr,
      message: offerData.message,
      createdAt: serverTimestamp(),
      status: 'pending',
      accepted: false,
      // Term is usually associated with the main loan request
      // If you intend each offer to potentially have a different term, add offerData.term here
      // and a term field to the OfferModal form.
      // For now, assuming term is fixed by the loanRequest.
      term: requestDetails.term // Store the original request's term for context if needed
    };

    try {
      const db = getFirestore();
      const offerDocRef = await addDoc(collection(db, 'loanOffers'), newLoanOffer);
      setSubmissionStatus({ type: 'success', message: `Offer submitted successfully! Offer ID: ${offerDocRef.id}` });
      setIsOfferModalOpen(false); // Close modal on successful submission
      // Optionally, you might want to re-fetch offers for this request if displayed on the page
    } catch (err) {
      console.error("Error submitting loan offer:", err);
      setSubmissionStatus({ type: 'error', message: `Failed to submit offer: ${err.message}` });
      return Promise.reject(err); // Reject to allow modal to handle its loading state
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <ArrowLeftIcon className="h-8 w-8 text-blue-600 animate-pulse" />
        <p className="mt-3 text-xl text-slate-700">Loading Request Details...</p>
      </div>
    );
  }

  if (error || !requestDetails) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
        <InformationCircleIcon className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Request Not Found</h2>
        <p className="text-slate-500">{error || 'The loan request you are looking for does not exist or could not be loaded.'}</p>
        {/* Add a button to go back or to all requests page */}
      </div>
    );
  }

  // Ensure requestDetails and its properties exist before calculations
  const targetAmount = requestDetails?.amount || 0; // Use requestDetails.amount
  const fundedSoFar = requestDetails?.amountFunded || 0; // Use requestDetails.amountFunded

  const fundedPercentage = targetAmount > 0 ? (fundedSoFar / targetAmount) * 100 : 0;
  const amountNeeded = targetAmount - fundedSoFar;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header-like section (can be made a sticky header component) */}
      <div className="bg-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-slate-100">
            <ArrowLeftIcon className="h-6 w-6 text-slate-700" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800">Fundraiser Preview</h1>
          <div className="w-8">{/* Spacer */}</div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Optional: Could add a banner image for the request here */}

          <div className="p-6 md:p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
              {requestDetails.title}
            </h2>

            <div className="md:flex md:space-x-8">
              {/* Left Column: Story, Borrower Info, Support */}
              <div className="md:w-2/3 space-y-6">
                {/* Check for top-level borrowerName or borrowerPhotoURL instead of nested object */}
                {requestDetails.borrowerName || requestDetails.borrowerPhotoURL ? (
                  <div className="flex items-center space-x-3 mb-6">
                    {requestDetails.borrowerPhotoURL ? (
                      <img src={requestDetails.borrowerPhotoURL} alt={requestDetails.borrowerName || 'Borrower'} className="h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ring-blue-500" />
                    ) : (
                      <UserCircleIcon className="h-12 w-12 text-slate-400" />
                    )}
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">{requestDetails.borrowerName || 'Borrower Name Not Available'}</span> is seeking support for their cause.
                      </p>
                      {/* Potential: <p className="text-xs text-slate-500">Joined: {new Date(requestDetails.createdAt).toLocaleDateString()}</p> */}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 mb-6">
                    <UserCircleIcon className="h-12 w-12 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">Borrower information loading or not provided.</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Story</h3>
                  <p>{requestDetails.story}</p>
                </div>

                {requestDetails.tags && requestDetails.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center">
                      <TagIcon className="h-4 w-4 mr-1.5" /> Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {requestDetails.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center space-x-3">
                  <button className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors">
                    <HeartIcon className="h-7 w-7" />
                  </button>
                  <span className="text-sm text-slate-600">Show your support for this GoFinanceMe</span>
                </div>
              </div>

              {/* Right Column: Funding, APR, Actions */}
              <div className="md:w-1/3 mt-8 md:mt-0">
                <div className="bg-slate-50 rounded-lg p-6 shadow-inner space-y-6 sticky top-24"> {/* Sticky for desktop */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-700">Funding Goal</h3>
                    <p className="text-4xl font-bold text-emerald-600 my-1">{formatCurrency(targetAmount)}</p>
                    <p className="text-sm text-slate-500">target</p>
                  </div>

                  <PieChart percentage={fundedPercentage} size={120} strokeWidth={10} />

                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Currently Funded:</span>
                      <span className="font-medium text-slate-700">{formatCurrency(fundedSoFar)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Needed:</span>
                      <span className="font-medium text-slate-700">{formatCurrency(amountNeeded > 0 ? amountNeeded : 0)}</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center"><ReceiptPercentIcon className="h-4 w-4 mr-1.5 text-slate-400" />Max APR:</span>
                      <span className="font-medium text-slate-700">{requestDetails.apr}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center"><ClockIcon className="h-4 w-4 mr-1.5 text-slate-400" />Term:</span>
                      <span className="font-medium text-slate-700">{requestDetails.term} months</span>
                    </div>
                  </div>

                  {submissionStatus.message && (
                    <div className={`p-3 rounded-md text-sm my-4 ${submissionStatus.type === 'error' ? 'bg-red-100 border border-red-300 text-red-700' :
                        submissionStatus.type === 'success' ? 'bg-green-100 border border-green-300 text-green-700' : ''
                      }`}>
                      {submissionStatus.message}
                    </div>
                  )}

                  {amountNeeded > 0 ? (
                    <button
                      onClick={() => setIsOfferModalOpen(true)} // Open modal on click
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-150 ease-in-out transform hover:scale-105"
                    >
                      Help Contribute                    </button>

                  ) : (
                    <div className="text-center py-3 px-5 rounded-lg bg-green-100 text-green-700 font-semibold">
                      Fully Funded!
                    </div>
                  )}

                  <button className="w-full mt-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 transition-colors">
                    <ShareIcon className="h-5 w-5 inline-block mr-2" /> Share
                  </button>

                  {/* Placeholder for guarantee info */}
                  <div className="flex items-start text-xs text-slate-500 mt-4 p-3 bg-slate-100 rounded-md">
                    <ShieldCheckIcon className="h-6 w-6 mr-2 text-sky-600 flex-shrink-0" />
                    <span><strong>GoFinanceMe Guarantee:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </main>
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmitOffer={handleOfferSubmit}
        loanRequestTitle={requestDetails?.title}
      />
    </div>
  );
};

export default RequestDetailPage;
