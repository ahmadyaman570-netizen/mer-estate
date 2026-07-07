// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-5d6b9.firebaseapp.com",
  projectId: "mern-estate-5d6b9",
  storageBucket: "mern-estate-5d6b9.firebasestorage.app",
  messagingSenderId: "323046798475",
  appId: "1:323046798475:web:c1dd5b979aa3774e89d08e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);