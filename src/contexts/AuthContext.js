// src/contexts/AuthContext.js
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Provide authError and a method to clear it to the context consumers
  const clearError = () => setAuthError(null);

  const signUp = async (email, password, firstName, lastName) => {
    setLoading(true); // Set loading to true at the start of the function
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email: user.email,
      });
      return { wasSuccessful: true };
    } catch (error) {
      console.error('Error signing up:', error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true); // Set loading to true at the start of the function
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { wasSuccessful: true };
    } catch (error) {
      console.error('Error signing in:', error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const userDocRef = await doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          firstName: user.displayName.split(' ')[0],
          lastName: user.displayName.split(' ')[1],
          email: user.email,
        });
      }
      return { wasSuccessful: true };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true); // Set loading to true at the start of the function
    try {
      await signOut(auth);
      return { wasSuccessful: true };
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    clearError,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        children // Display children when not loading
      )}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
