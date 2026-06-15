import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const newChatBtn = document.getElementById("new-chat-btn");

newChatBtn.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) {
    alert("Сначала войдите");
    return;
  }

  try {

    await addDoc(
      collection(db, "chats"),
      {
        userId: user.uid,
        title: "Новый чат",
        createdAt: serverTimestamp()
      }
    );

    alert("Чат создан");

  } catch (error) {

    console.error(error);
    alert(error.message);

  }

});