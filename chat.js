import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const newChatBtn = document.getElementById("new-chat-btn");
const chatsList = document.getElementById("chats-list");

newChatBtn.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) return;

  await addDoc(
    collection(db, "chats"),
    {
      userId: user.uid,
      title: "Новый чат",
      createdAt: serverTimestamp()
    }
  );

});

auth.onAuthStateChanged?.(() => {});

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

  if (!user) return;

  const q = query(
    collection(db, "chats"),
    where("userId", "==", user.uid)
  );

  onSnapshot(q, (snapshot) => {

    chatsList.innerHTML = "";

    snapshot.forEach((docItem) => {

      const div = document.createElement("div");

      div.className = "chat-item";

      div.textContent = docItem.data().title;

      chatsList.appendChild(div);

    });

  });

});