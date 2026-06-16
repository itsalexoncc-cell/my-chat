import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const newChatBtn = document.getElementById("new-chat-btn");
const chatsList = document.getElementById("chats-list");
const messages = document.getElementById("messages");

let activeChatId = null;

newChatBtn.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) return;

  const docRef = await addDoc(
    collection(db, "chats"),
    {
      userId: user.uid,
      title: `Чат ${Date.now()}`,
      createdAt: serverTimestamp()
    }
  );

  activeChatId = docRef.id;

  messages.innerHTML = `
    <h2>Новый чат</h2>
    <p>ID: ${docRef.id}</p>
  `;
});

onAuthStateChanged(auth, (user) => {

  if (!user) return;

  const q = query(
    collection(db, "chats"),
    where("userId", "==", user.uid)
  );

  onSnapshot(q, (snapshot) => {

    chatsList.innerHTML = "";

    snapshot.forEach((chatDoc) => {

      const data = chatDoc.data();

      const div = document.createElement("div");

      div.className = "chat-item";

      div.textContent = data.title;

      div.addEventListener("click", async () => {

        activeChatId = chatDoc.id;

        const chatRef = doc(db, "chats", chatDoc.id);

        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) return;

        const chatData = chatSnap.data();

        messages.innerHTML = `
          <h2>${chatData.title}</h2>
          <p>Чат открыт</p>
          <p>ID: ${chatDoc.id}</p>
        `;

      });

      chatsList.appendChild(div);

    });

  });

});