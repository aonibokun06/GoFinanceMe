// //import necessary firebase fucnitons and libraires to access firestore!
// import { getFirestore, collection, query, where, getCountFromServer } from 'firebase/firestore';
// import { useEffect, useState } from 'react';

// //function to calculate loan payment
// export const calculateLoanPayment = (loanAmount, interestRate, loanTermMonths) => {
//     const totalInterest = loanAmount * (interestRate / 100) * loanTermMonths;
//     const totalPayment = loanAmount + totalInterest;