// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile as updateAuthProfile } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
  collection,
  setDoc
} from 'firebase/firestore';

const ProfileForm = ({setIsProfileCreated}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  const [form, setForm] = useState({
    fullName: '',
    photoURL: '',
    interests: '',
    personalStory: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ error: '', success: '' });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const createUserProfileInFirestore = async (profileData) => {
    if (!user) {
      setMsg({ error: "You must be logged in to create a profile.", success: '' });
      return;
    }
    try {
      const userProfileRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userProfileRef);
      if (docSnap.exists()) {
        await updateDoc(userProfileRef, {
          ...profileData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(collection(db, "users"), user.uid), {
          ...profileData,
          email: user.email,
          createdAt: serverTimestamp(),
          uid: user.uid,
        });
      }
      await updateAuthProfile(user, {
        fullName: profileData.fullName,
        photoURL: profileData.photoURL,
      });
      setMsg({ success: 'Profile updated successfully!', error: '' });
    } catch (error) {
      console.error("Error saving profile: ", error);
      setMsg({ error: `Error saving profile: ${error.message}`, success: '' });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setMsg({ error: '', success: '' });
    setLoading(true);
    try {
      const profileData = {
        fullName: form.fullName,
        photoURL: form.photoURL,
        interests: form.interests.split(',').map(interest => interest.trim()).filter(interest => interest),
        personalStory: form.personalStory,
      };
      await createUserProfileInFirestore(profileData);
    } catch (e) {
      setMsg(msg => ({ ...msg, error: e.message }));
    } finally {
      setLoading(false);
      setIsProfileCreated(true);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const userProfileRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userProfileRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setForm({
              fullName: data.fullName || user.fullName || '',
              photoURL: data.photoURL || user.photoURL || '',
              interests: (data.interests || []).join(', '),
              personalStory: data.personalStory || '',
            });
          } else {
            setForm(prev => ({
                ...prev,
                fullName: user.fullName || '',
                photoURL: user.photoURL || '',
                intersts: user.interests || '',
                personalStory: user.personalStory || '',
            }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setMsg({ error: "Could not load profile data.", success: ''});
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, db]);

  if (loading && !user) return <p className="p-4 text-center text-gray-600">Please log in to manage your profile.</p>;
  if (loading) return <p className="p-4 text-center text-gray-600">Loading Profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            Your Profile
          </h2>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Jane Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                Interests (comma-separated)
              </label>
              <input
                id="interests"
                name="interests"
                type="text"
                value={form.interests}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Hiking, Coding, Reading"
              />
            </div>

            <div>
              <label htmlFor="personalStory" className="block text-sm font-medium text-gray-700 mb-1">
                Personal Story
              </label>
              <textarea
                id="personalStory"
                name="personalStory"
                value={form.personalStory}
                onChange={onChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Tell us a bit about yourself..."
              />
            </div>
            
            <div>
              <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700 mb-1">
                Photo URL
              </label>
              <input
                id="photoURL"
                name="photoURL"
                type="url"
                value={form.photoURL}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {msg.error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">
              <p className="font-medium">Error:</p>
              <p>{msg.error}</p>
            </div>
          )}
          {msg.success && (
            <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow">
              <p className="font-medium">Success:</p>
              <p>{msg.success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;