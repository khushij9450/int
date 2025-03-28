import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Log environment variables to ensure they're set correctly
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("FIREBASE_PRIVATE_KEY exists:", !!process.env.FIREBASE_PRIVATE_KEY);

// Initialize Firebase Admin and Firestore
const initFirebaseAdmin = () => {
  const apps = getApps();
  let auth, db;

  // Only initialize if no apps exist
  if (!apps.length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
      console.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);
      throw new Error("Failed to initialize Firebase Admin SDK");
    }

    // Initialize Firestore and set settings
    db = getFirestore();
    db.settings({ ignoreUndefinedProperties: true });

    // Initialize Auth
    auth = getAuth();
  } else {
    // If already initialized, reuse the existing instances
    db = getFirestore();
    auth = getAuth();
  }

  return { auth, db };
};

// Export the initialized instances
export const { auth, db } = initFirebaseAdmin();