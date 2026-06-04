import { postsRef, addDoc, query, orderBy, onSnapshot, serverTimestamp } from './config.js';
import * as state from './state.js';

const feedItems   = document.getElementById("feed-items");
const newPostModal = document.getElementById("new-post-modal");
const newPostInput = document.getElementById("new-post-input");

export function loadFeed() {
    const q = query(postsRef, orderBy("createdAt", "desc"));

    onSnapshot(q, snapshot => {
        feedItems.innerHTML = "";

        if (snapshot.empty) {
            feedItems.innerHTML = `<div class="feed-empty"><div class="feed-empty-icon">✍️</div><div class="feed-empty-text">Пока нет постов<br>Будь первым!</div></div>`;
            return;
        }

        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const el   = document.createElement("div");
            el.className = "post-card";

            const ts = post.createdAt?.toDate?.();
            const timeStr = ts ? formatTime(ts) : "";

            el.innerHTML = `
                <div class="post-header">
                    <div class="post-avatar">
                        ${post.avatar ? `<img src="${post.avatar}">` : "👤"}
                    </div>
                    <div>
                        <div class="post-author-name">${post.name || "Unknown"}</div>
                        <div class="post-author-username">@${post.username || ""}</div>
                    </div>
                    <div class="post-time">${timeStr}</div>
                </div>
                <div class="post-text">${post.text}</div>
                <div class="post-actions">
                    <button class="post-action-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                        Нравится
                    </button>
                    <button class="post-action-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                        Ответить
                    </button>
                </div>`;

            feedItems.appendChild(el);
        });
    });
}

function formatTime(date) {
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)   return "только что";
    if (diff < 3600) return Math.floor(diff / 60) + " мин";
    if (diff < 86400) return Math.floor(diff / 3600) + " ч";
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

window.openPostModal = function() {
    newPostModal.classList.add("active");
    setTimeout(() => newPostInput.focus(), 100);
};

window.closePostModal = function() {
    newPostModal.classList.remove("active");
    newPostInput.value = "";
};

window.submitPost = async function() {
    const text = newPostInput.value.trim();
    if (!text) return;

    try {
        await addDoc(postsRef, {
            deviceId:  state.deviceId,
            name:      state.myName,
            username:  state.myUsername,
            avatar:    state.myAvatar,
            text,
            createdAt: serverTimestamp()
        });
        window.closePostModal();
    } catch(e) { console.error(e); }
};

// Закрыть модал по клику на оверлей
newPostModal.addEventListener("click", e => {
    if (e.target === newPostModal) window.closePostModal();
});
