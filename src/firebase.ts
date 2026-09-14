// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKGwggulwf2sGi28Hxxm-H5iOLqVQPdSE",
  authDomain: "ionic-crud-be344.firebaseapp.com",
  databaseURL: "https://ionic-crud-be344-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "ionic-crud-be344",
  storageBucket: "ionic-crud-be344.firebasestorage.app",
  messagingSenderId: "872857667505",
  appId: "1:872857667505:web:d46c98538553622f499f90",
  measurementId: "G-X7276P20WJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);