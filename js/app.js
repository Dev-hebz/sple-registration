// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBIYMgewErOAhJIPdSlnRMw8b_3HXlEQ9Y",
    authDomain: "sple-registration.firebaseapp.com",
    projectId: "sple-registration",
    storageBucket: "sple-registration.firebasestorage.app",
    messagingSenderId: "303053898858",
    appId: "1:303053898858:web:52fecf93e03f87e7737613"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
