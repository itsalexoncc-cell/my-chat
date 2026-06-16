import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const loginBtn = document.getElementById("login-btn");
const userInfo = document.getElementById("user-info");

async function signIn() {
  try {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider);

  } catch (error) {
    console.error("Ошибка входа:", error);
    alert(error.message);
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", signIn);
}

onAuthStateChanged(auth, async (user) => {

  const authScreen = document.getElementById("auth-screen");
  const appScreen = document.getElementById("app");

  if (!user) {

    if (authScreen) authScreen.style.display = "flex";
    if (appScreen) appScreen.style.display = "none";

    return;
  }

  try {

    await setDoc(
      doc(db, "users", user.uid),
      {
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp()
      },
      { merge: true }
    );

  } catch (error) {
    console.error("Ошибка Firestore:", error);
  }

  if (authScreen) authScreen.style.display = "none";
  if (appScreen) appScreen.style.display = "flex";

  if (userInfo) {
    userInfo.innerHTML = `
      <p>${user.displayName || "Без имени"}</p>
      <p>${user.email || ""}</p>
    `;
  }

});