console.log("auth.js loaded");
import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  setPersistence,
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

  alert("Кнопка нажата");

  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch(error) {
    alert(error.message);
    console.error(error);
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

document.getElementById("auth-screen").style.display = "none";

document.getElementById("app").style.display = "flex";

userInfo.innerHTML = `
  <p>${user.displayName}</p>
  <p>${user.email}</p>
`;