import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/solid'; // Using heroicons for the back arrow
import { useLocation, useNavigate } from 'react-router-dom'; // Added imports
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Added Firestore imports
import { getAuth } from 'firebase/auth'; // Added Auth import

const MAX_TITLE_LENGTH = 60;
const MAX_STORY_LENGTH = 2000;

const RequestStep2Form = ({ onBack, initialData = {} }) => {
  const location = useLocation(); // Added useLocation hook
  const navigate = useNavigate(); // Added useNavigate hook
  const step1Data = location.state?.step1Data;

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    story: initialData.story || '',
    tags: initialData.tags ? (Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags) : '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' }); // Added for success/error messages

  const [titleCharCount, setTitleCharCount] = useState(formData.title.length);
  const [storyCharCount, setStoryCharCount] = useState(formData.story.length);

  useEffect(() => {
    if (!step1Data) {
      console.warn("Step 1 data not found, redirecting to /request");
      navigate('/request'); // Redirect if no step1Data
    }
  }, [step1Data, navigate]);

  useEffect(() => {
    setTitleCharCount(formData.title.length);
  }, [formData.title]);

  useEffect(() => {
    setStoryCharCount(formData.story.length);
  }, [formData.story]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' && value.length > MAX_TITLE_LENGTH) return;
    if (name === 'story' && value.length > MAX_STORY_LENGTH) return;

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a title for your request.';
    }
    if (!formData.story.trim()) {
      newErrors.story = 'Please tell us your story.';
    }
    if (formData.story.trim().length < 50) {
        newErrors.story = `Your story should be at least 50 characters long. (Current: ${formData.story.trim().length})`;
    }
    // Basic tag validation (e.g., not empty if tags are intended to be mandatory, or format)
    // For now, tags are optional
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => { // Made async
    e.preventDefault();
    setSubmitMessage({ type: '', text: '' }); // Clear previous messages

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSubmitMessage({ type: 'error', text: 'You must be logged in to create a request.' });
      setIsSubmitting(false);
      return;
    }

    const step2Data = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
    };
    
    const finalRequestData = {
      ...step1Data,
      ...step2Data,
      borrowerId: currentUser.uid,
      borrowerName: currentUser.displayName || 'Anonymous User', // Optional: store displayName
      borrowerPhotoURL: currentUser.photoURL || '', // Optional: store photoURL
      createdAt: serverTimestamp(),
      status: 'seekingFunds', // Initial status
      amountFunded: 0, // Initial amount funded
      // Ensure numeric types are stored as numbers if step1Data might have them as strings
      amount: parseFloat(step1Data.amount),
      maxAPR: parseFloat(step1Data.maxAPR),
      term: parseInt(step1Data.term, 10),
    };

    try {
      const db = getFirestore();
      const docRef = await addDoc(collection(db, 'loanRequests'), finalRequestData);
      console.log('Document written with ID: ', docRef.id);
      setSubmitMessage({ type: 'success', text: 'Loan request submitted successfully!' });
      // Navigate to the new request's detail page or a summary page
      navigate(`/my-requests`); // Or navigate(`/request/${docRef.id}`) if you have such a route
    } catch (error) {
      console.error('Error adding document: ', error);
      setSubmitMessage({ type: 'error', text: `Error submitting request: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If step1Data is not yet available (e.g., during initial render before useEffect redirect),
  // you might want to show a loading state or return null to prevent rendering the form prematurely.
  if (!step1Data) {
    return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><p className="text-xl">Loading...</p></div>; 
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
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
              Step 2 of 3 {/* Assuming 3 steps for now */}
            </div>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Tell us about your loan request
          </h1>
          <p className="text-base text-slate-600 mb-8">
            This information will help potential lenders understand your needs and why your request is important.
          </p>

          {submitMessage.text && (
            <div className={`mb-6 p-4 rounded-md text-sm ${
              submitMessage.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' : 
              submitMessage.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : ''
            }`}>
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Section */}
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-slate-700 mb-1">
                Give your loan request a title
              </label>
              <div className="relative mt-1">
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border ${errors.title ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-colors`}
                  placeholder="E.g., Seed funding for my new eco-friendly cafe"
                  maxLength={MAX_TITLE_LENGTH} // HTML5 max length
                  aria-invalid={errors.title ? "true" : "false"}
                  aria-describedby={errors.title ? "title-error" : undefined}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-500 pointer-events-none">
                  {titleCharCount}/{MAX_TITLE_LENGTH}
                </div>
              </div>
              {errors.title && <p className="mt-2 text-sm text-red-600" id="title-error">{errors.title}</p>}
            </div>

            {/* Story Section */}
            <div>
              <label htmlFor="story" className="block text-lg font-semibold text-slate-700 mb-1">
                Tell your story
              </label>
              <p className="text-sm text-slate-500 mb-2">
                Introduce yourself, what you're raising funds for, describe why it's important to you, and how the funds will be used.
              </p>
              <div className="relative">
                <textarea
                  id="story"
                  name="story"
                  rows="8"
                  value={formData.story}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border ${errors.story ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors`}
                  placeholder="Start with a brief introduction..."
                  maxLength={MAX_STORY_LENGTH} // HTML5 max length
                  aria-invalid={errors.story ? "true" : "false"}
                  aria-describedby={errors.story ? "story-error" : undefined}
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 text-xs text-slate-500 bg-slate-100 rounded pointer-events-none">
                  {storyCharCount}/{MAX_STORY_LENGTH}
                </div>
              </div>
              {/* Simple formatting buttons placeholder - can be expanded into a proper toolbar */}
              <div className="mt-2 flex items-center space-x-2 text-slate-500">
                {/* Example icons - replace with actual icon components or SVGs */}
                {/* <button type="button" className="p-2 hover:bg-slate-100 rounded"><PhotoIcon className="h-5 w-5" /></button> */}
                {/* <button type="button" className="p-2 hover:bg-slate-100 rounded font-bold">B</button> */}
                {/* <button type="button" className="p-2 hover:bg-slate-100 rounded italic">I</button> */}
                {/* <button type="button" className="p-2 hover:bg-slate-100 rounded"><LinkIcon className="h-5 w-5" /></button> */}
                {/* <button type="button" className="p-2 hover:bg-slate-100 rounded"><ListBulletIcon className="h-5 w-5" /></button> */}
              </div>
              {errors.story && <p className="mt-2 text-sm text-red-600" id="story-error">{errors.story}</p>}
            </div>

            {/* Tags Section */}
            <div>
              <label htmlFor="tags" className="block text-lg font-semibold text-slate-700 mb-1">
                Add tags (comma-separated)
              </label>
              <p className="text-sm text-slate-500 mb-2">
                Help lenders find your request by adding relevant keywords.
              </p>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                className={`block w-full px-4 py-3 border ${errors.tags ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors`}
                placeholder="e.g., small business, startup, eco-friendly, community"
                aria-invalid={errors.tags ? "true" : "false"}
                aria-describedby={errors.tags ? "tags-error" : undefined}
              />
              {errors.tags && <p className="mt-2 text-sm text-red-600" id="tags-error">{errors.tags}</p>}
            </div>

            {/* Navigation Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting} // Disable button when submitting
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RequestStep2Form; 