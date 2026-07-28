import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD73BL_ZKPcOjY1hz2iKcFMqE9bvQaw9hI",
  authDomain: "smart-resource-allocatio-ff7e5.firebaseapp.com",
  projectId: "smart-resource-allocatio-ff7e5",
  storageBucket: "smart-resource-allocatio-ff7e5.firebasestorage.app",
  messagingSenderId: "253886096641",
  appId: "1:253886096641:web:6f26bc4cff839c67bba700",
  measurementId: "G-X9DENDWEJD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { db, auth, googleProvider };