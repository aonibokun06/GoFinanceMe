import React from 'react'
import Profile from '../components/Profile'
import ProfileForm from '../components/ProfileForm'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useEffect, useState } from 'react'
/**
 * ProfilePage
 * (path: /profile )
 */
//you're profile page
const ProfilePage = ({ userId }) => {
  //collects user id
  const [isProfileCreated, setIsProfileCreated] = useState(true)
  //create empty user object
  const [user, setUser] = useState({
    fullName: '',
    email: '',
    photoURL: '',
    interests: '',
    personalStory: ''
  })
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      if (!userId) {
        // If userId is not available, ensure profile is not marked as created
        // and reset user state if necessary.
        setIsProfileCreated(false);
        setUser({
          fullName: '',
          email: '',
          photoURL: '',
          interests: '',
          personalStory: ''
        });
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log("userData")
          setUser(userData); // Queue state update for user
          console.log("userData")
          console.log(userData);
          // Determine if a profile is considered "created"
          // For example, if fullName is a required field for a created profile:
          if (userData.fullName && userData.fullName.trim() !== '') {
            setIsProfileCreated(true);
          } else {
            // Profile document might exist but essential data is missing
            setIsProfileCreated(false);
          }
        } else {
          // User document does not exist
          setIsProfileCreated(false);
          setUser({ // Reset user data if profile doesn't exist
            fullName: '',
            email: '',
            photoURL: '',
            interests: '',
            personalStory: ''
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsProfileCreated(false);
        setUser({ // Reset user data on error
          fullName: '',
          email: '',
          photoURL: '',
          interests: '',
          personalStory: ''
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId]); // userId is the correct dependency. db is stable as it's imported.

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      {isProfileCreated ? (
        <Profile fullName={user.fullName} email={user.email} photoURL={user.photoURL} interests={user.interests} personalStory={user.personalStory} />
      ) : (
        <ProfileForm setIsProfileCreated={setIsProfileCreated} userId={userId} />
      )}
    </div>
  )
}

export default ProfilePage
