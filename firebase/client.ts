// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpmWkxXQdKGaxzFcExTf9eWuRGMmXqDrk",
  authDomain: "prepwise-b807c.firebaseapp.com",
  projectId: "prepwise-b807c",
  storageBucket: "prepwise-b807c.firebasestorage.app",
  messagingSenderId: "451101948827",
  appId: "1:451101948827:web:2f7820b98f4c46354d7f3e",
  measurementId: "G-YVELDM4R85"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);