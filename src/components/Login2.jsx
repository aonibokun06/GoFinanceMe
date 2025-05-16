// Auth.jsx
import React, { useState } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';

const Login2 = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const db = getFirestore();

  // Common post-login: ensure Firestore profile exists
  const ensureUserProfile = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        role: 'borrower'
      });
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await ensureUserProfile(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError(null);
    const displayName = e.target.displayName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // update displayName in auth profile
      await user.updateProfile({ displayName });
      // now write Firestore profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName,
        email: user.email,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        role: 'borrower'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        {isLogin ? 'Sign In' : 'Sign Up'}
      </h1>
      <button
        onClick={handleGoogleAuth}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
      </button>

      <form 
        onSubmit={isLogin ? handleEmailLogin : handleEmailSignup} 
        className="flex flex-col gap-4 w-80"
      >
        {!isLogin && (
          <input
            type="text"
            name="displayName"
            placeholder="Your Name"
            className="border p-2 rounded"
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded ${
            isLogin ? 'bg-green-500' : 'bg-purple-600'
          } text-white`}
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-6 text-sm text-gray-600 underline"
      >
        {isLogin
          ? "Don't have an account? Sign Up"
          : 'Already have an account? Sign In'}
      </button>
    </div>
  );
};

export default Login2;