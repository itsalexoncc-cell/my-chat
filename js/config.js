import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    where,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDjrf31YqY1DZK9cFHPUDiFIZF2xcVsVZc",
    authDomain: "ios-chat-7b9eb.firebaseapp.com",
    projectId: "ios-chat-7b9eb",
    storageBucket: "ios-chat-7b9eb.firebasestorage.app",
    messagingSenderId: "175359872932",
    appId: "1:175359872932:web:0f97b172eba4d411a0bb31",
    measurementId: "G-0589PK5QFQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const messagesRef = collection(db, "messages");
export const usersRef    = collection(db, "users");

export {
    addDoc,
    setDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    where,
    deleteDoc
};
