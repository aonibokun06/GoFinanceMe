import React from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChatBubbleLeftEllipsisIcon, UserCircleIcon, NoSymbolIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon, HandThumbDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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

const LoanOfferCard = ({ offer, onAccept, onDecline, isProcessing, isRequestFunded, currentUserId }) => {

  // Determine if action buttons should be shown at all
  const showActionButtons = offer.status === 'pending';
  
  // Accept button specific condition
  const canAccept = offer.status === 'pending' && !isRequestFunded;
  // Decline button specific condition (can always decline a pending offer regardless of request funding status)
  const canDecline = offer.status === 'pending';

  const handleAccept = () => {
    if (!canAccept || isProcessing) return;
    onAccept(offer); // Parent now passes the full offer object to onAccept
  };

  const handleDecline = () => {
    if (!canDecline || isProcessing) return;
    onDecline(offer.id);
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
        return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full flex items-center"><NoSymbolIcon className="h-3.5 w-3.5 mr-1"/>Auto-Declined</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">{offer.status || 'Unknown'}</span>;
    }
  };

  let cardBorderColor = 'border-transparent'; // Default or for pending
  if (offer.status === 'accepted') {
    cardBorderColor = 'border-green-500';
  } else if (offer.status === 'declined') {
    cardBorderColor = 'border-red-500';
  } else if (offer.status === 'auto-declined') {
    cardBorderColor = 'border-slate-400';
  }

  return (
    <div className={`bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 ${cardBorderColor}`}>
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

      {/* Action buttons section - only shown for pending offers */}
      {showActionButtons && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            disabled={!canAccept || isProcessing} // Disabled if not canAccept or if isProcessing
            className={`flex-1 justify-center text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out flex items-center
                       ${canAccept ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-500' : 'bg-slate-400 cursor-not-allowed'}
                       disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isProcessing ? (
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
            ) : <HandThumbUpIcon className="h-5 w-5 mr-2" />}
            Accept Offer
          </button>
          <button
            onClick={handleDecline}
            disabled={!canDecline || isProcessing} // Disabled if not canDecline or if isProcessing
            className={`flex-1 justify-center font-medium py-2.5 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center
                        ${canDecline ? 'text-slate-700 bg-slate-200 hover:bg-slate-300 focus:ring-slate-400' : 'text-slate-500 bg-slate-100 cursor-not-allowed' }
                        disabled:opacity-60 disabled:cursor-not-allowed`}
          >
             {isProcessing ? (
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
            ) : <HandThumbDownIcon className="h-5 w-5 mr-2" />}
            Decline Offer
          </button>
        </div>
      )}
      
      {/* Display a clear message if request is funded and this offer was not the accepted one but was pending */}
      {isRequestFunded && offer.status === 'pending' && (
        <div className="px-5 py-3 bg-yellow-50 border-t border-yellow-200 text-center">
          <p className="text-xs text-yellow-700">
            This loan request has been funded by another offer. This offer can no longer be accepted.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoanOfferCard; 