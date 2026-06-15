import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const loginBtn = document.getElementById("login-btn");
const userInfo = document.getElementById("user-info");
const newChatBtn = document.getElementById("new-chat-btn");

loginBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, provider);
    console.log("Вошёл:", result.user.displayName);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  await setDoc(
    doc(db, "users", user.uid),
    {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );

  userInfo.innerHTML = `
    <p>${user.displayName}</p>
    <p>${user.email}</p>
  `;

  loginBtn.style.display = "none";
  newChatBtn.style.display = "block";
});
