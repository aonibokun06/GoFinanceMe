// MyRequestCard.jsx
import React, { useState } from 'react';

const MyRequestCard = ({ request, onFund }) => {
  const [isLoading, setIsLoading] = useState(false);
  const progress = (request.fundedSoFar / request.amount) * 100;
  const isFullyFunded = request.fundedSoFar >= request.amount;

  const handleFundClick = async () => {
    try {
      setIsLoading(true);
      await onFund(request.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded shadow-md bg-white">
      <h3 className="text-lg font-bold">Amount: ${request.amount?.toLocaleString()}</h3>
      <p>Max APR: {request.maxAPR}%</p>
      <p>Term: {request.term} months</p>
      
      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-sm mt-1">
          Funded: ${request.fundedSoFar?.toLocaleString()} / ${request.amount?.toLocaleString()}
        </p>
      </div>
    <div>
        <p className="text-sm mt-1">Amount you owe: ${request.amount?.toLocaleString()}</p>
        <p className="text-sm mt-1">Amount you have paid: ${request.fundedSoFar?.toLocaleString()}</p>
    </div>
        
      <button
        onClick={handleFundClick}
        disabled={isLoading || isFullyFunded}
        className={`w-full mt-3 px-4 py-2 rounded font-medium transition-colors duration-200 ${
          isFullyFunded
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isLoading
            ? 'bg-blue-400 text-white cursor-wait'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isFullyFunded 
          ? 'Fully Funded' 
          : isLoading 
          ? 'Processing...' 
          : 'Pay $100'}
      </button>
    </div>
  );
};

export default MyRequestCard;