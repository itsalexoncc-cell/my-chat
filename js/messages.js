import { messagesRef, addDoc, query, where, onSnapshot, serverTimestamp, deleteDoc } from './config.js';
import * as state from './state.js';
import { setUnsubscribeChat } from './state.js';
import { chatWindow } from './ui.js';

const msgInput   = document.getElementById("msg-input");
const sendBtn    = document.getElementById("send-btn");
const imageBtn   = document.getElementById("image-btn");
const imageInput = document.getElementById("image-input");

export function buildMsgEl(msg, animate = false) {
    const isOutgoing = msg.deviceId === state.deviceId;
    const el = document.createElement("div");
    el.className = `msg ${isOutgoing ? "outgoing" : "incoming"}${animate ? "" : ""}`;
    if (animate) el.style.animation = "msgPop .2s cubic-bezier(.34,1.56,.64,1)";

    const avatarSrc = msg.avatar || "";
    let content = `
        <div class="msg-meta">
            <div class="msg-avatar-small">
                ${avatarSrc ? `<img src="${avatarSrc}">` : "👤"}
            </div>
            <span class="msg-name">${msg.name || "Unknown"}</span>
        </div>`;

    if (msg.text) {
        content += `<div class="msg-bubble">${msg.text}</div>`;
    }

    if (msg.image) {
        content += `
            <div class="msg-bubble">
                <div class="photo-preview" onclick="window.togglePhoto(this)">
                    <div class="photo-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                    </div>
                    <span>Фото</span>
                </div>
                <img class="photo-full" src="${msg.image}" alt="Фото">
            </div>`;
    }

    el.innerHTML = content;
    return el;
}

export function loadChat(chatId) {
    if (state.unsubscribeChat) {
        state.unsubscribeChat();
        setUnsubscribeChat(null);
    }

    chatWindow.innerHTML = "";
    const renderedIds   = new Set();
    let initialDone     = false;

    const q   = query(messagesRef, where("chatId", "==", chatId));
    const unsub = onSnapshot(q, snapshot => {
        if (!initialDone) {
            const msgs = [];
            snapshot.forEach(d => {
                msgs.push({ id: d.id, data: d.data() });
                renderedIds.add(d.id);
            });
            msgs.sort((a, b) => (a.data.createdAt?.toMillis?.() ?? 0) - (b.data.createdAt?.toMillis?.() ?? 0));
            msgs.forEach(({ id, data }) => {
                const el = buildMsgEl(data, false);
                el.dataset.msgId = id;
                chatWindow.appendChild(el);
            });
            chatWindow.scrollTop = chatWindow.scrollHeight;
            initialDone = true;
        } else {
            let scroll = false;
            snapshot.docChanges().forEach(change => {
                const docId = change.doc.id;
                if (change.type === "added" && !renderedIds.has(docId)) {
                    renderedIds.add(docId);
                    const el = buildMsgEl(change.doc.data(), true);
                    el.dataset.msgId = docId;
                    chatWindow.appendChild(el);
                    scroll = true;
                } else if (change.type === "removed") {
                    renderedIds.delete(docId);
                    chatWindow.querySelector(`[data-msg-id="${docId}"]`)?.remove();
                }
            });
            if (scroll) chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }, e => console.error(e));

    setUnsubscribeChat(unsub);
}

async function sendMessage() {
    const text = msgInput.value.trim();
    if (!text || !state.currentChatId) return;
    msgInput.value = "";
    try {
        await addDoc(messagesRef, {
            deviceId:  state.deviceId,
            name:      state.myName,
            avatar:    state.myAvatar,
            text,
            chatId:    state.currentChatId,
            createdAt: serverTimestamp()
        });
    } catch(e) { console.error(e); }
}

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

imageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file || !state.currentChatId) return;

    const reader = new FileReader();
    reader.onload = event => {
        const img = new Image();
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx    = canvas.getContext("2d");
            const max    = 1280;
            let w = img.width, h = img.height;
            if (w > h ? w > max : h > max) {
                if (w > h) { h *= max/w; w = max; } else { w *= max/h; h = max; }
            }
            canvas.width = w; canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            try {
                await addDoc(messagesRef, {
                    deviceId:  state.deviceId,
                    name:      state.myName,
                    avatar:    state.myAvatar,
                    image:     canvas.toDataURL("image/jpeg", 0.7),
                    chatId:    state.currentChatId,
                    createdAt: serverTimestamp()
                });
            } catch(e) { console.error(e); }
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

window.togglePhoto = function(preview) {
    preview.nextElementSibling.classList.toggle("open");
};
