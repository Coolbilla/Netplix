import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Change this to your actual custom domain (DO NOT include https://)
// Example: authDomain: "www.my-movie-site.com"
const firebaseConfig = {
    apiKey: "AIzaSyB-WlCA-p4jIVPG0hysoTusuAC4FDV9eeQ",
    authDomain: "netplix.shop",
    projectId: "netplayer2-eba6b",
    storageBucket: "netplayer2-eba6b.firebasestorage.app",
    messagingSenderId: "842818078740",
    appId: "1:842818078740:web:30127ff9885ab5dbe4ff01",
    measurementId: "G-868S9176V8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
