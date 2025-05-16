import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
VITE_FIREBASE_API_KEY=AIzaSyB5wtW8XGuOYFGgYAPoE5tm634AZLG9SW4
VITE_FIREBASE_AUTH_DOMAIN=test-e6d7a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=test-e6d7a
VITE_FIREBASE_STORAGE_BUCKET=test-e6d7a.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=112718336612
VITE_FIREBASE_APP_ID=1:112718336612:web:1d99f8ee74be3aea4e4571
VITE_FIREBASE_MEASUREMENT_ID=G-1QQK1PES9R
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);


import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

async function bootstrapCollections() {
  // 1) Create a "users" collection with a dummy or template doc
  await setDoc(doc(db, 'users', 'TEMPLATE_USER'), {
    uid:         'TEMPLATE_USER',
    displayName: 'Template User',
    email:       'template@example.com',
    photoURL:    null,
    role:        'borrower',
    createdAt:   serverTimestamp()
  });

  // 2) Create a "loans" collection with a dummy or template doc
  await setDoc(doc(db, 'loanOffers', 'TEMPLATE_LOAN_OFFER'), {
    amount:        1000,
    loanRequestId: 'loanRequest1',
    apr:           5,
    lenderId:      'TEMPLATE_USER',
    term:          12,
    status:        'pending',
    createdAt:     serverTimestamp()
  });

  console.log('Collections bootstrapped');
}

bootstrapCollections();