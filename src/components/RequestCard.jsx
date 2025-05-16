import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CurrencyDollarIcon, ReceiptPercentIcon, ClockIcon } from '@heroicons/react/24/outline';

// Helper function to format currency (if not imported from a shared util)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Circular Progress/Pie Chart Component (adapted for this card)
const CircularProgressBar = ({ percentage, size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="#e5e7eb" fill="transparent" /> {/* gray-200 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#10b981" // emerald-500 for Financed part
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-emerald-600">{`${percentage.toFixed(0)}%`}</span>
      </div>
    </div>
  );
};

const RequestCard = ({ request, onFund }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Ensure request and its properties exist before calculations
  const targetAmount = request.amount || 0;
  const fundedSoFar = request.fundedSoFar || 0;
  const progress = targetAmount > 0 ? (fundedSoFar / targetAmount) * 100 : 0;
  const isFullyFunded = fundedSoFar >= targetAmount && targetAmount > 0;
  const amountNeeded = targetAmount - fundedSoFar;

  const briefStory = request.story
    ? (request.story.length > 100 ? request.story.substring(0, 100) + '...' : request.story)
    : 'No description provided.';

  if (!request || !request.id) {
    return (
      <div className="border p-4 rounded-lg shadow-lg bg-white flex flex-col justify-between animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="w-3/4">
            <h3 className="text-lg font-semibold text-slate-800 leading-tight truncate" title={request.title || 'Untitled Request'}>
              {request.title || 'Untitled Request'}
            </h3>
            {/* <p className="text-xs text-slate-500">ID: {request.id}</p> */}
          </div>
          <CircularProgressBar percentage={progress} />
        </div>

        <p className="text-sm text-slate-600 mb-4 min-h-[3.5em]">
          {briefStory}
        </p>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center"><CurrencyDollarIcon className="h-4 w-4 mr-1.5 text-slate-400" />Target:</span>
            <span className="font-medium text-slate-700">{formatCurrency(targetAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center"><ReceiptPercentIcon className="h-4 w-4 mr-1.5 text-slate-400" />APR:</span>
            <span className="font-medium text-slate-700">{request.maxAPR || request.apr || 'N/A'}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center"><ClockIcon className="h-4 w-4 mr-1.5 text-slate-400" />Term:</span>
            <span className="font-medium text-slate-700">{request.term || 'N/A'} months</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 mb-1">
          <span>Financed: {formatCurrency(fundedSoFar)}</span>
          {targetAmount > 0 && <span className="text-emerald-600 font-medium"> ({progress.toFixed(0)}%)</span>}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 bg-slate-50 border-t border-slate-100">
        {/* {!isFullyFunded && (
            // <div className="mb-3">
            //     <label htmlFor={`fundAmount-${request.id}`} className="block text-xs font-medium text-slate-600 mb-1">
            //     Amount to Support:
            //     </label>
            //     <div className="flex items-center">
            //         <span className="text-slate-500 text-sm mr-1">$</span>
            //         <input
            //             type="number"
            //             id={`fundAmount-${request.id}`}
            //             value={fundAmount}
            //             onChange={(e) => setFundAmount(Number(e.target.value))}
            //             className="block w-full px-2 py-1.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
            //             min="1"
            //             max={amountNeeded > 0 ? amountNeeded : undefined} 
            //             disabled={isFullyFunded || isLoading}
            //         />
            //     </div>
            // </div>
        )} */}

        <div className="space-y-2">
          {/* The button below is removed */}
          {/* <button
            onClick={handleFundClick}
            disabled={isLoading || isFullyFunded || fundAmount <= 0 || fundAmount > amountNeeded}
            className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center 
              ${
                isFullyFunded
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : isLoading
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
          >
            {isFullyFunded
              ? 'Fully Financed'
              : isLoading
                ? 'Processing...'
                : `Support ${formatCurrency(fundAmount)}`}
          </button> */}
          <Link
            to={`/requests/${request.id}`}
            className="block w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-all duration-150 ease-in-out text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            View Details & Fund <ArrowRightIcon className="inline h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;