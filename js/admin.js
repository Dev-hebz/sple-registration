// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 FIREBASE CONFIG (CHECK THIS)
const firebaseConfig = {
  apiKey: "AIzaSyBIYMgewErOAhJIPdSlnRMw8b_3HXlEQ9Y",
  authDomain: "sple-registration.firebaseapp.com",
  projectId: "sple-registration",
  storageBucket: "sple-registration.firebasestorage.app",
  messagingSenderId: "303053898858",
  appId: "1:303053898858:web:52fecf93e03f87e7737613"
};

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM
const authStatus = document.getElementById("authStatus");
const dashboard = document.getElementById("dashboard");
const userList = document.getElementById("userList");
const logoutBtn = document.getElementById("logoutBtn");

// AUTH CHECK
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authStatus.innerHTML = "❌ Not logged in. Redirecting...";
    setTimeout(() => {
      window.location.href = "/admin-login.html";
    }, 1500);
    return;
  }

  authStatus.innerHTML = `✅ Logged in as <b>${user.email}</b>`;
  dashboard.classList.remove("hidden");

  loadUsers();
});

// LOAD DATA
async function loadUsers() {
  try {
    const snap = await getDocs(collection(db, "registrations"));
    if (snap.empty) {
      userList.innerHTML = "No records found.";
      return;
    }

    let html = "<ul>";
    snap.forEach(doc => {
      const d = doc.data();
      html += `<li>${d.name || "No name"} - ${d.email || ""}</li>`;
    });
    html += "</ul>";

    userList.innerHTML = html;
  } catch (err) {
    console.error(err);
    userList.innerHTML = "❌ Permission denied or error loading data.";
  }
}

// LOGOUT
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/admin-login.html";
});
