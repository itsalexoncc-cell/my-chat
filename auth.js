import { auth } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const loginBtn = document.getElementById("login-btn");
const userInfo = document.getElementById("user-info");

loginBtn.addEventListener("click", async () => {

    const provider = new GoogleAuthProvider();

    try {

        await signInWithPopup(auth, provider);

    } catch(error){

        console.error(error);

    }

});

onAuthStateChanged(auth, (user) => {

    if(user){

        userInfo.innerHTML = `
            <p>${user.displayName}</p>
            <p>${user.email}</p>
        `;

        loginBtn.style.display = "none";
    }

});
