// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClGbHO_P1ExuLteJ7TlZrQu7MTV7ID-HU",
  authDomain: "keywordapp-ad572.firebaseapp.com",
  databaseURL: "https://keywordapp-ad572-default-rtdb.firebaseio.com",
  projectId: "keywordapp-ad572",
  storageBucket: "keywordapp-ad572.appspot.com",
  messagingSenderId: "558806526659",
  appId: "1:558806526659:web:cdf1c153b9076257675076",
  measurementId: "G-CTS3BN3QM6"

};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);