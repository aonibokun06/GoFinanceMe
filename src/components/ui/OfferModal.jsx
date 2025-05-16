import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const OfferModal = ({ 
  isOpen, 
  onClose, 
  onSubmitOffer, 
  loanRequestTitle, 
  // requestedAmount, // Max amount a lender can offer can be derived if needed from total requested - already funded
  // requestedAPR // For context if needed
}) => {
  const [offerAmount, setOfferAmount] = useState('');
  const [offerAPR, setOfferAPR] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset form when modal opens/closes or title changes (new request context)
    if (isOpen) {
      setOfferAmount('');
      setOfferAPR('');
      setOfferMessage('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, loanRequestTitle]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      newErrors.offerAmount = 'Please enter a valid amount.';
    }
    // Add more specific validation e.g. if (parseFloat(offerAmount) > maxOfferableAmount) ...
    if (!offerAPR || parseFloat(offerAPR) <= 0 || parseFloat(offerAPR) > 100) {
      newErrors.offerAPR = 'Please enter a valid APR (0.01-100).';
    }
    // Message is optional, so no validation unless specific rules apply
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmitOffer({
        amount: parseFloat(offerAmount),
        apr: parseFloat(offerAPR),
        message: offerMessage.trim(),
      });
      // onClose(); // Usually, the parent component calls onClose after successful submission
    } catch (error) {
      console.error("Error submitting offer in modal:", error);
      setErrors(prev => ({ ...prev, general: 'Failed to submit offer. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-gradient-to-br from-slate-50 to-sky-100 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Make an Offer
            </h3>
            <p className="text-sm text-slate-600 mt-1">For: {loanRequestTitle || 'Loan Request'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="offerAmount" className="block text-sm font-medium text-slate-700 mb-1">
              Amount you want to contribute ($)
            </label>
            <input
              id="offerAmount"
              name="offerAmount"
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className={`w-full px-4 py-2.5 border ${errors.offerAmount ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-slate-400`}
              placeholder="e.g., 500.00"
              required
              disabled={isSubmitting}
            />
            {errors.offerAmount && <p className="mt-1 text-xs text-red-600">{errors.offerAmount}</p>}
          </div>

          <div>
            <label htmlFor="offerAPR" className="block text-sm font-medium text-slate-700 mb-1">
              Your offered APR (%)
            </label>
            <input
              id="offerAPR"
              name="offerAPR"
              type="number"
              value={offerAPR}
              onChange={(e) => setOfferAPR(e.target.value)}
              min="0.01"
              max="100"
              step="0.01"
              className={`w-full px-4 py-2.5 border ${errors.offerAPR ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-slate-400`}
              placeholder="e.g., 5.5"
              required
              disabled={isSubmitting}
            />
            {errors.offerAPR && <p className="mt-1 text-xs text-red-600">{errors.offerAPR}</p>}
          </div>

          <div>
            <label htmlFor="offerMessage" className="block text-sm font-medium text-slate-700 mb-1">
              Optional message to the borrower
            </label>
            <textarea
              id="offerMessage"
              name="offerMessage"
              rows="3"
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-slate-400"
              placeholder="e.g., 'Happy to support your project! Good luck.'"
              disabled={isSubmitting}
            />
            {/* Consider adding a character counter here if needed */}
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
              {errors.general}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto justify-center text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out
                         bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:ring-purple-500
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Offer'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto justify-center text-slate-700 bg-slate-200 hover:bg-slate-300 font-medium py-2.5 px-6 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal; 