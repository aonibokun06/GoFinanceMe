import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, getCountFromServer, limit, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CalendarDaysIcon, BanknotesIcon, ClockIcon, CheckCircleIcon, ArrowPathIcon, DocumentTextIcon, ChatBubbleLeftEllipsisIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import MyRequests from '../components/MyRequests';
// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Simple SVG Pie Chart Component
const PieChart = ({ percentage, size = 120 }) => {
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#e5e7eb" // bg-gray-200
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#3b82f6" // fill-blue-500
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-blue-600">{`${percentage.toFixed(0)}%`}</span>
        <span className="text-xs text-slate-500">Paid Off</span>
      </div>
    </div>
  );
};

// Simple Progress Bar Component
const ProgressBar = ({ percentage, height = 'h-4' }) => {
  return (
    <div className={`w-full bg-slate-200 rounded-full ${height} overflow-hidden`}>
      <div
        className="bg-gradient-to-r from-blue-500 to-sky-500 h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // State for "My Active Loan Request" widget
  const [userLoanRequest, setUserLoanRequest] = useState(null);
  const [pendingOffersCount, setPendingOffersCount] = useState(0);
  const [isLoadingUserRequestData, setIsLoadingUserRequestData] = useState(true);

  // State for funded loan details (to populate overview sections)
  const [fundedLoanDetails, setFundedLoanDetails] = useState(null);
  const [isLoadingFundedLoan, setIsLoadingFundedLoan] = useState(true);

  // loanData will be a mix of real (from fundedLoanDetails) and mock (for repayment progress)
  const [loanData, setLoanData] = useState({
    totalLoanAmount: 20000,
    amountPaid: 0,
    nextPaymentDueDate: '2024-07-15',
    nextPaymentAmount: 550.75,
    loanTermMonths: 36,
    monthsPaid: 12,
    interestRate: 5.5,
  });

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingDashboard(true);
      setIsLoadingUserRequestData(true);
      setIsLoadingFundedLoan(true);

      if (user) {
        setCurrentUser(user);

        // 1. Fetch user's active loan request (seekingFunds)
        try {
          const qRequest = query(
            collection(db, 'loanRequests'),
            where('borrowerId', '==', user.uid),
            where('status', '==', 'seekingFunds'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          const requestSnapshot = await getDocs(qRequest);
          if (!requestSnapshot.empty) {
            const requestDoc = requestSnapshot.docs[0];
            const requestData = { id: requestDoc.id, ...requestDoc.data() };
            setUserLoanRequest(requestData);
            console.log(requestData);
            // Fetch pending offers count for this request
            const qOffers = query(
              collection(db, 'loanOffers'),
              where('loanRequestId', '==', requestData.id),
              where('status', '==', 'pending')
            );
            const offersSnapshot = await getCountFromServer(qOffers);
            setPendingOffersCount(offersSnapshot.data().count);
          } else {
            setUserLoanRequest(null);
            setPendingOffersCount(0);
          }
        } catch (error) {
          console.error("Error fetching user's active loan request or offers:", error);
          setUserLoanRequest(null);
          setPendingOffersCount(0);
        } finally {
          setIsLoadingUserRequestData(false);
        }

        // 2. Fetch user's funded loan
        try {
          const qFunded = query(
            collection(db, 'loanRequests'),
            where('borrowerId', '==', user.uid),
            where('status', '==', 'funded'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          const fundedSnapshot = await getDocs(qFunded);
          if (!fundedSnapshot.empty) {
            const fundedDoc = fundedSnapshot.docs[0].data();
            setFundedLoanDetails(fundedDoc);
            // Update parts of loanData with real details
            setLoanData(prevData => ({
              ...prevData,
              totalLoanAmount: fundedDoc.amount || prevData.totalLoanAmount,
              loanTermMonths: fundedDoc.term || prevData.loanTermMonths,
              interestRate: fundedDoc.finalAPR || prevData.interestRate,
            }));
          } else {
            setFundedLoanDetails(null);
            // If no funded loan, loanData uses default mock values for totalAmount, term, rate
            setLoanData(prevData => ({
              ...prevData,
              // Potentially reset to default mocks if a funded loan was previously shown
              // For now, we'll let them persist if user had one then it disappeared (edge case)
              // Or explicitly reset:
              totalLoanAmount: 20000,
              loanTermMonths: 36,
              interestRate: 5.5,
            }));
          }
        } catch (error) {
          console.error("Error fetching user's funded loan:", error);
          setFundedLoanDetails(null);
        } finally {
          setIsLoadingFundedLoan(false);
        }

      } else {
        setCurrentUser(null);
        setUserLoanRequest(null);
        setPendingOffersCount(0);
        setFundedLoanDetails(null);
        setIsLoadingUserRequestData(false);
        setIsLoadingFundedLoan(false);
        // Reset loanData to full mock if user logs out
        setLoanData({
          totalLoanAmount: 20000, amountPaid: 7500, nextPaymentDueDate: '2024-07-15',
          nextPaymentAmount: 550.75, loanTermMonths: 36, monthsPaid: 12, interestRate: 5.5,
        });
      }
      setLoadingDashboard(false); // All initial loading attempts are done
    });

    return () => unsubscribe();
  }, []); // Empty dependency array, onAuthStateChanged handles updates

  // Recalculate derived values when loanData changes
  const amountRemaining = loanData.totalLoanAmount - loanData.amountPaid;
  const paidPercentage = loanData.totalLoanAmount > 0 ? (loanData.amountPaid / loanData.totalLoanAmount) * 100 : 0;
  const termProgressPercentage = loanData.loanTermMonths > 0 ? (loanData.monthsPaid / loanData.loanTermMonths) * 100 : 0;

  const formattedDueDate = loanData.nextPaymentDueDate && !isNaN(new Date(loanData.nextPaymentDueDate))
    ? new Date(loanData.nextPaymentDueDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    : 'N/A';

  if (loadingDashboard) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="ml-3 text-xl text-slate-700">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
          Loan Dashboard
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Overview of your active loan and repayment progress.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start mb-8">
        {/* My Active Loan Request Widget - REVISED */}
        <div className="lg:col-span-1 bg-white shadow-2xl rounded-xl p-6 h-full flex flex-col justify-between hover:shadow-blue-300 hover:scale-[1.02] transition-all duration-300 ease-out">
          {isLoadingUserRequestData ? (
            <div className="flex flex-col items-center justify-center h-full">
              <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin mb-2" />
              <p className="text-sm text-slate-500">Loading your request...</p>
            </div>
          ) : currentUser && userLoanRequest ? (
            <>
              <div>
                <h2 className="text-xl font-semibold text-slate-700 mb-2 flex items-center">
                  <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-600" />
                  My Active Request
                </h2>
                <p className="text-md font-medium text-slate-800 truncate" title={userLoanRequest.title}>
                  {userLoanRequest.title}
                </p>
                <p className="text-sm text-slate-500 mb-1">
                  Amount: {formatCurrency(userLoanRequest.amount)}
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  Status: <span className="font-medium text-yellow-600">{userLoanRequest.status}</span>
                </p>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-slate-600">
                    <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-1.5 text-blue-500" />
                    <span className="text-sm">{pendingOffersCount} Pending Offer(s)</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/request/offers/${userLoanRequest.id}`)}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:from-blue-700 hover:to-sky-600 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Offers
                </button>
              </div>
            </>
          ) : currentUser ? (
            <>
              <div>
                <h2 className="text-xl font-semibold text-slate-700 mb-2 flex items-center">
                  <DocumentPlusIcon className="h-6 w-6 mr-2 text-green-600" />
                  No Active Request
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  You don't have any loan requests currently seeking funds.
                </p>
              </div>
              <button
                onClick={() => navigate('/request')} // Navigate to request creation step 1
                className="w-full mt-auto py-2.5 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create New Loan Request
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-slate-500">Please log in to see your requests.</p>
            </div>
          )}
        </div>

        {/* Left Column: Next Payment & Pie Chart (Data partly dynamic) */}
        <div className="lg:col-span-1 space-y-8">
          {/* Next Payment Card */}
          <div className="bg-white shadow-2xl rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-700 mb-1 flex items-center">
              <CalendarDaysIcon className="h-6 w-6 mr-2 text-blue-600" />
              Next Payment Due
            </h2>
            <p className="text-3xl font-bold text-blue-600">{!isLoadingFundedLoan && fundedLoanDetails ? formattedDueDate : (isLoadingFundedLoan ? 'Loading...' : 'N/A')}</p>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Amount:</span>
                <span className="text-lg font-semibold text-slate-700">
                  {!isLoadingFundedLoan && fundedLoanDetails ? formatCurrency((amountRemaining*(loanData.interestRate/100)/12) + (amountRemaining/loanData.loanTermMonths)) : (isLoadingFundedLoan ? 'Loading...' : formatCurrency(loanData.nextPaymentAmount))}
                </span>
              </div>
              <button className="w-full mt-3 py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Make a Payment
              </button>
            </div>
          </div>

          {/* Pie Chart Card */}
          <div className="bg-white shadow-2xl rounded-xl p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Loan Repayment Status</h2>
            {isLoadingFundedLoan ? (
              <div className="flex flex-col items-center justify-center h-[160px]">
                <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                <p className="text-sm text-slate-500">Loading status...</p>
              </div>
            ) : fundedLoanDetails || !currentUser ? (
              <>
                <PieChart percentage={paidPercentage} />
                <div className="mt-4 text-center w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Paid:</span>
                    <span className="font-medium text-green-600">{formatCurrency(loanData.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Remaining:</span>
                    <span className="font-medium text-red-600">{formatCurrency(amountRemaining)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[160px]">
                <BanknotesIcon className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 text-center">No funded loan found to display repayment status.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Loan Progress Details (Data partly dynamic) */}
        <div className="lg:col-span-1 bg-white shadow-2xl rounded-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6 flex items-center">
            <BanknotesIcon className="h-7 w-7 mr-3 text-green-600" />
            Overall Loan Progress
          </h2>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-medium text-slate-600">Total Loan Amount</span>
              <span className="text-xl font-bold text-slate-800">
                {isLoadingFundedLoan ? 'Loading...' : formatCurrency(loanData.totalLoanAmount)}
              </span>
            </div>
            <ProgressBar percentage={paidPercentage} height="h-5" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{formatCurrency(loanData.amountPaid)} Paid</span>
              <span>{formatCurrency(amountRemaining)} Remaining</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6 pt-6 border-t border-slate-200">
            <div className="flex items-start p-3 bg-slate-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Amount Paid</p>
                <p className="text-lg font-semibold text-slate-700">{formatCurrency(loanData.amountPaid)}</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-slate-50 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Remaining Balance</p>
                <p className="text-lg font-semibold text-slate-700">{formatCurrency(amountRemaining)}</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-slate-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-sky-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Term Progress</p>
                <p className="text-lg font-semibold text-slate-700">
                  {isLoadingFundedLoan ? 'Loading...' : `${loanData.monthsPaid} / ${loanData.loanTermMonths} months`}
                </p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-slate-50 rounded-lg">
              <span className="text-sky-600 font-bold text-lg mr-2 mt-0.5">%</span>
              <div>
                <p className="text-sm text-slate-500">Interest Rate</p>
                <p className="text-lg font-semibold text-slate-700">
                  {isLoadingFundedLoan ? 'Loading...' : `${loanData.interestRate.toFixed(1)}%`}
                </p>
              </div>
            </div>
          </div>

          {isLoadingFundedLoan ? (
            <div className="mt-6 flex items-center justify-center">
              <ArrowPathIcon className="h-6 w-6 text-blue-600 animate-spin mr-2" />
              <span className="text-sm text-slate-500">Loading term progress...</span>
            </div>
          ) : fundedLoanDetails || !currentUser ? (
            termProgressPercentage < 100 &&
            <div className="mt-6">
              <h3 className="text-md font-semibold text-slate-700 mb-2">Term Progress</h3>
              <ProgressBar percentage={termProgressPercentage} height="h-3" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{loanData.monthsPaid} months completed</span>
                <span>{loanData.loanTermMonths > 0 ? loanData.loanTermMonths - loanData.monthsPaid : 0} months remaining</span>
              </div>
            </div>
          ) : null}

          {isLoadingFundedLoan ? null : fundedLoanDetails || !currentUser ? (
            paidPercentage >= 100 && (
              <div className="mt-8 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-green-700">Congratulations!</h3>
                <p className="text-green-600">This loan has been fully paid off.</p>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
