 
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
 
const firebaseConfig = {
  apiKey: "AIzaSyDGjwobQ2NpXVkQ2wzLZaeXdmL_AUd-bIo",
  authDomain: "prepwise-ai-15b86.firebaseapp.com",
  projectId: "prepwise-ai-15b86",
  storageBucket: "prepwise-ai-15b86.firebasestorage.app",
  messagingSenderId: "811659533940",
  appId: "1:811659533940:web:532c9c2d0af2f36f80bb21",
  measurementId: "G-FEXFFV551V"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
 

export const auth = getAuth(app);
export const db = getFirestore(app);