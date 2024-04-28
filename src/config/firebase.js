import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2gJP93l2A9kwqffzDEEfM2OTSKaV8Hd0",
  authDomain: "polysolution-main.firebaseapp.com",
  projectId: "polysolution-main",
  storageBucket: "polysolution-main.appspot.com",
  messagingSenderId: "165039215705",
  appId: "1:165039215705:web:bbebb5dbc0eeabea330d48",
  measurementId: "G-KMQDJ9MS19",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
