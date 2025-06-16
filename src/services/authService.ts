import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser, // Alias FirebaseUser to avoid naming conflicts if you have your own User type
  type AuthError
} from 'firebase/auth';
import { app } from '../config/firebaseConfig'; // Adjust path as needed

export const auth = getAuth(app);

export interface AuthUser { // Define a simpler User structure if needed, or use FirebaseUser directly
  uid: string;
  email: string | null;
  // Add other properties you might need from the FirebaseUser object
}

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
};

export const onAuthUserChanged = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// You might also want a function to get the current user synchronously, though onAuthStateChanged is preferred for real-time updates
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
