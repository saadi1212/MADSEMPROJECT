import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeBQopgsfvi8Yh5RfVd_CJgNccu1Sfr6E",
  authDomain: "photographerbookingapp-ae612.firebaseapp.com",
  projectId: "photographerbookingapp-ae612",
  storageBucket: "photographerbookingapp-ae612.appspot.com",
  messagingSenderId: "425925526956",
  appId: "1:425925526956:web:7f6db6e5dfc796152c6609",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
