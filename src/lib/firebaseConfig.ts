import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6xpf11uKlEanzLDD8LH2Ppw17w5yhjeQ",
  authDomain: "so-textilehub.firebaseapp.com",
  projectId: "so-textilehub",
  storageBucket: "so-textilehub.firebasestorage.app",
  messagingSenderId: "1069557492843",
  appId: "1:1069557492843:web:5d5bfde51ba596bd9dd52e",
  measurementId: "G-ZKRWBRQXJ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Auth

// Remove anonymous sign-in as we are implementing full authentication
// signInAnonymously(auth)
//   .then(() => {
//     console.log("Signed in anonymously to Firebase.");
//   })
//   .catch((error) => {
//     console.error("Error signing in anonymously:", error);
//   });

export { db, auth };
