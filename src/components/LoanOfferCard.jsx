import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChatBubbleLeftEllipsisIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'Date not available';
  return timestamp.toDate().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
};

const LoanOfferCard = ({ offer, onAcceptOffer, onDeclineOffer, loanRequestStatus }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const canTakeAction = offer.status === 'pending' && loanRequestStatus === 'seekingFunds';

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAcceptOffer(offer.id, offer); // Pass full offer for context if needed by parent
    setIsAccepting(false);
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    await onDeclineOffer(offer.id);
    setIsDeclining(false);
  };

  const getStatusPill = () => {
    switch (offer.status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center"><ClockIcon className="h-3.5 w-3.5 mr-1"/>Pending</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center"><CheckCircleIcon className="h-3.5 w-3.5 mr-1"/>Accepted</span>;
      case 'declined':
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center"><XCircleIcon className="h-3.5 w-3.5 mr-1"/>Declined</span>;
      case 'auto-declined':
        return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full flex items-center"><XCircleIcon className="h-3.5 w-3.5 mr-1"/>Auto-Declined</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">{offer.status}</span>;
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            {offer.lenderPhotoURL ? (
              <img src={offer.lenderPhotoURL} alt={offer.lenderName || 'Lender'} className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200" />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-slate-400" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800">{offer.lenderName || 'Anonymous Lender'}</p>
              <p className="text-xs text-slate-500">Offered: {formatDate(offer.createdAt)}</p>
            </div>
          </div>
          {getStatusPill()}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
          <div>
            <p className="text-xs text-slate-500">Amount Offered</p>
            <p className="font-semibold text-slate-700 text-base">{formatCurrency(offer.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Offered APR</p>
            <p className="font-semibold text-slate-700 text-base">{offer.apr}%</p>
          </div>
        </div>

        {offer.message && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-purple-500 float-left mr-2 mt-0.5"/>
            <p className="italic whitespace-pre-line">{offer.message}</p>
          </div>
        )}
      </div>

      {canTakeAction && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            disabled={isAccepting || isDeclining}
            className="flex-1 justify-center text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out
                       bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-500
                       disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
          >
            {isAccepting ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : <HandThumbUpIcon className="h-5 w-5 mr-2" />}
            Accept Offer
          </button>
          <button
            onClick={handleDecline}
            disabled={isAccepting || isDeclining}
            className="flex-1 justify-center text-slate-700 bg-slate-200 hover:bg-slate-300 font-medium py-2.5 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors 
                       disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
          >
             {isDeclining ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : <HandThumbDownIcon className="h-5 w-5 mr-2" />}
            Decline Offer
          </button>
        </div>
      )}
    </div>
  );
};

export default LoanOfferCard; 