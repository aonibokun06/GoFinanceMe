import React, { useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const RequestStep1Form = ({ onBack, initialData = {} }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: initialData.amount || '',
    maxAPR: initialData.maxAPR || '',
    term: initialData.term || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid dollar amount.';
    }
    if (!formData.maxAPR || parseFloat(formData.maxAPR) <= 0 || parseFloat(formData.maxAPR) > 100) {
      newErrors.maxAPR = 'Please enter a valid Max APR (0.01-100).';
    }
    if (!formData.term || parseInt(formData.term) <= 0) {
      newErrors.term = 'Please enter a valid term (in months).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Request Step 1 Data:', formData);
      navigate('/request/details', { state: { step1Data: formData } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {onBack && (
                <button
                  onClick={onBack}
                  className="mr-2 p-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-label="Go back"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
              )}
              <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                GoFinanceMe
              </span>
            </div>
            <div className="text-sm font-medium text-slate-500">
              Step 1 of 3
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Loan Request Details
          </h1>
          <p className="text-base text-slate-600 mb-8">
            Please provide the basic details for your loan request.
          </p>

          <div className="bg-white py-8 px-4 shadow-2xl rounded-xl sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="amount" className="block text-lg font-semibold text-slate-700 mb-1">
                  Dollar Amount ($)
                </label>
                <div className="mt-1">
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    className={`block w-full px-4 py-3 border ${errors.amount ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-colors`}
                    placeholder="e.g., 5000.00"
                    aria-invalid={errors.amount ? "true" : "false"}
                    aria-describedby={errors.amount ? "amount-error" : undefined}
                  />
                </div>
                {errors.amount && <p className="mt-2 text-sm text-red-600" id="amount-error">{errors.amount}</p>}
              </div>

              <div>
                <label htmlFor="maxAPR" className="block text-lg font-semibold text-slate-700 mb-1">
                  Maximum APR (%)
                </label>
                <div className="mt-1">
                  <input
                    id="maxAPR"
                    name="maxAPR"
                    type="number"
                    value={formData.maxAPR}
                    onChange={handleChange}
                    min="0.01"
                    max="100"
                    step="0.01"
                    className={`block w-full px-4 py-3 border ${errors.maxAPR ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-colors`}
                    placeholder="e.g., 12.5"
                    aria-invalid={errors.maxAPR ? "true" : "false"}
                    aria-describedby={errors.maxAPR ? "maxAPR-error" : undefined}
                  />
                </div>
                {errors.maxAPR && <p className="mt-2 text-sm text-red-600" id="maxAPR-error">{errors.maxAPR}</p>}
              </div>

              <div>
                <label htmlFor="term" className="block text-lg font-semibold text-slate-700 mb-1">
                  Loan Term (months)
                </label>
                <div className="mt-1">
                  <input
                    id="term"
                    name="term"
                    type="number"
                    value={formData.term}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    className={`block w-full px-4 py-3 border ${errors.term ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-colors`}
                    placeholder="e.g., 36"
                    aria-invalid={errors.term ? "true" : "false"}
                    aria-describedby={errors.term ? "term-error" : undefined}
                  />
                </div>
                {errors.term && <p className="mt-2 text-sm text-red-600" id="term-error">{errors.term}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-slate-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-150 ease-in-out transform hover:scale-105"
                >
                  Next Step
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestStep1Form; 