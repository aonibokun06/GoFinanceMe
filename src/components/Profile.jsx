// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile as updateAuthProfile } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
const Profile = ({fullName, email, photoURL, interests, personalStory}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    photoURL: '',
    role: '',
    createdAt: null
  });
  const [form, setForm] = useState({ fullName: '', photoURL: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ error: '', success: '' });

  // 1) Load profile
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            fullName: data.fullName,
            email:        data.email,
            photoURL:     data.photoURL || '',
            role:         data.role,
            createdAt:    data.createdAt?.toDate() || null
          });
          setForm({
            fullName: data.fullName,
            photoURL:     data.photoURL || ''
          });
        }
      } catch (e) {
        setMsg(msg => ({ ...msg, error: e.message }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, db]);

  // 2) Handle form changes
  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // 3) Submit updates
  const onSubmit = async e => {
    e.preventDefault();
    setMsg({ error: '', success: '' });
    setLoading(true); // Start loading when submission begins
    try {
      const ref = doc(db, 'users', user.uid);
      // Update Firestore
      await updateDoc(ref, {
        fullName: form.fullName,
        photoURL:    form.photoURL,
        updatedAt:   serverTimestamp()
      });
      // Update Firebase Auth profile
      await updateAuthProfile(user, { fullName: form.fullName, photoURL: form.photoURL });
      setProfile(p => ({ ...p, fullName: form.fullName, photoURL: form.photoURL }));
      setMsg({ success: 'Profile updated!' }); // Set success message
    } catch (e) {
      setMsg({ error: e.message }); // Set error message
    } finally {
      setLoading(false); // Stop loading regardless of outcome
    }
    // setIsProfileCreated(true) // This line seems out of place here, Profile component doesn't control this.
  };

  if (loading && !profile.email) return ( // Show detailed loading only if profile data isn't partially available
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex justify-center items-center p-4">
      <p className="text-2xl font-semibold text-white">Loading Profile...</p>
      {/* You could add a spinner here */}
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-xl p-6 sm:p-10">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-10">
          Your Profile
        </h2>

        {/* Photo */}
        <div className="flex flex-col items-center mb-8">
          {profile.photoURL
            ? <img
                src={profile.photoURL}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-offset-2 ring-blue-500 shadow-lg"
              />
            : <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-lg font-medium ring-4 ring-slate-300 shadow-md">
                No Photo
              </div>
          }
           <p className="mt-4 text-2xl font-semibold text-slate-700">{profile.fullName || 'User'}</p>
           <p className="text-sm text-slate-500">{profile.email}</p>
        </div>


        {/* Read-only info - consider if this section is still needed if editable fields cover it */}
        <div className="space-y-3 bg-slate-50 p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">Account Details</h3>
          <p className="text-sm"><span className="font-medium text-slate-600">UID:</span> <span className="text-slate-800 break-all">{user.uid}</span></p>
          {/* email is displayed above, role and joined can stay if relevant */}
          {profile.role && <p className="text-sm"><span className="font-medium text-slate-600">Role:</span> <span className="text-slate-800">{profile.role}</span></p>}
          {profile.createdAt && (
            <p className="text-sm">
              <span className="font-medium text-slate-600">Joined:</span>{' '}
              <span className="text-slate-800">{profile.createdAt.toLocaleDateString()}</span>
            </p>
          )}
           {/* Displaying interests and personal story from props */}
          {interests && (Array.isArray(interests) ? interests.join(', ') : interests) && (
            <p className="text-sm">
              <span className="font-medium text-slate-600">Interests:</span>{' '}
              <span className="text-slate-800">{Array.isArray(interests) ? interests.join(', ') : interests}</span>
            </p>
          )}
          {personalStory && (
            <p className="text-sm">
              <span className="font-medium text-slate-600">Personal Story:</span>{' '}
              <span className="text-slate-800 whitespace-pre-line">{personalStory}</span>
            </p>
          )}
        </div>


        {/* Edit form for Full Name and Photo URL */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={onChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-slate-400"
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="photoURL">
              Photo URL
            </label>
            <input
              id="photoURL"
              name="photoURL"
              type="url"
              value={form.photoURL}
              onChange={onChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-slate-400"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>

        {/* Messages */}
        {msg.error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">
            <p className="font-medium">Error:</p>
            <p>{msg.error}</p>
          </div>
        )}
        {msg.success && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow">
            <p className="font-medium">Success!</p>
            <p>{msg.success}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;