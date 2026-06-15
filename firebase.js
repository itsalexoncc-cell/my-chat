import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2j1py7y0siVjExktf6IrD5cXWtZOKQQw",
  authDomain: "my-chat-92d92.firebaseapp.com",
  projectId: "my-chat-92d92",
  storageBucket: "my-chat-92d92.firebasestorage.app",
  messagingSenderId: "390173597344",
  appId: "1:390173597344:web:f33ec03db2464e5de673c5",
  measurementId: "G-XPBLYVQ8CR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);