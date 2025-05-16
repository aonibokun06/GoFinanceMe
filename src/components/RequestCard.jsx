import React, { useState } from 'react';

const RequestCard = ({ request, onFund }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fundAmount, setFundAmount] = useState(100); // Default funding amount
  const progress = (request.fundedSoFar / request.amount) * 100;
  const isFullyFunded = request.fundedSoFar >= request.amount;

  const handleFundClick = async () => {
    try {
      setIsLoading(true);
      await onFund(request.id, fundAmount); // Pass the custom amount to the onFund function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded shadow-md bg-white">
      <h3 className="text-lg font-bold">Amount: ${request.amount?.toLocaleString()}</h3>
      <p>APR: {request.maxAPR}%</p>
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

      {/* Input for custom funding amount */}
      <div className="mt-3">
        <label htmlFor="fundAmount" className="block text-sm font-medium text-gray-700">
          Enter Amount to Fund:
        </label>
        <input
          type="number"
          id="fundAmount"
          value={fundAmount}
          onChange={(e) => setFundAmount(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          min="1"
          max={request.amount - request.fundedSoFar} // Prevent overfunding
          disabled={isFullyFunded || isLoading}
        />
      </div>

      <button
        onClick={handleFundClick}
        disabled={isLoading || isFullyFunded || fundAmount <= 0}
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
          : `Fund $${fundAmount}`}
      </button>
    </div>
  );
};

export default RequestCard;