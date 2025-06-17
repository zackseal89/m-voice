import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics"; // Optional: if you want to use Analytics

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7J5gWyWuQQ5m_06xOBJHRvygUHdbnPZk",
  authDomain: "gen-lang-client-0971713280.firebaseapp.com", // Usually projectID.firebaseapp.com
  projectId: "gen-lang-client-0971713280",
  storageBucket: "gen-lang-client-0971713280.appspot.com", // Usually projectID.appspot.com
  messagingSenderId: "578003020337", // This is the Project Number
  appId: "1:578003020337:ios:47a819b5c72afc3e37c310", // You can use either iOS or Android App ID here, or web if you have one. For core JS SDK, one is enough.
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional: for Google Analytics, if you set it up.
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Optional: if you want to use Analytics

// Export the initialized app and other Firebase services as needed
export { app };

// Export Auth instance
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);

// Initialize and export Firestore
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);

// Initialize and export Functions
import { getFunctions } from "firebase/functions";
export const functions = getFunctions(app);