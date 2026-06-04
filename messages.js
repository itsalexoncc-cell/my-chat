import {
    db, messagesRef,
    addDoc, setDoc, doc,
    query, where, orderBy, onSnapshot,
    serverTimestamp, deleteDoc
} from './config.js';
import {
    deviceId, myName, myAvatar,
    currentChatId,
    unsubscribeChat, setUnsubscribeChat
} from './state.js';
import { chatWindow } from './ui.js';

// ===== ЭЛЕМЕНТЫ =====
const msgInput   = document.getElementById("msg-input");
const sendBtn    = document.getElementById("send-btn");
const imageBtn   = document.getElementById("image-btn");
const imageInput = document.getElementById("image-input");

// ===== ПОСТРОИТЬ ЭЛЕМЕНТ СООБЩЕНИЯ =====
export function buildMsgEl(msg, animate = false) {
    const isOutgoing = msg.deviceId === deviceId;

    const msgEl       = document.createElement("div");
    msgEl.className   = `msg ${isOutgoing ? 'outgoing' : 'incoming'}${animate ? ' msg-fly' : ''}`;

    const avatarSrc   = msg.avatar || "";

    let content = `
        <div class="msg-sender">
            ${avatarSrc
                ? `<img class="msg-avatar" src="${avatarSrc}">`
                : `<span class="msg-avatar" style="display:flex;align-items:center;justify-content:center;font-size:14px;">👤</span>`}
            <span class="name">${msg.name || "Unknown"}</span>
        </div>`;

    if (msg.text) {
        content += `<div class="msg-bubble">${msg.text}</div>`;
    }

    if (msg.image) {
        content += `
            <div class="msg-bubble">
                <div class="photo-preview" onclick="window.togglePhoto(this)">
                    <div class="photo-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M8 5L6.5 7H5C3.9 7 3 7.9 3 9V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V9C21 7.9 20.1 7 19 7H17.5L16 5H8Z"
                                stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="13" r="3.2" stroke="currentColor" stroke-width="1.8"/>
                        </svg>
                    </div>
                    <span>Фото</span>
                </div>
                <img class="photo-full" src="${msg.image}" alt="Фото">
            </div>`;
    }

    msgEl.innerHTML = content;
    return msgEl;
}

// ===== ЗАГРУЗКА ЧАТА (REALTIME) =====
export function loadChat(chatId) {
    import('./state.js').then(state => {
        if (state.unsubscribeChat) {
            state.unsubscribeChat();
            setUnsubscribeChat(null);
        }
    });

    chatWindow.innerHTML = "";

    const renderedIds    = new Set();
    let initialLoadDone  = false;

    const q = query(messagesRef, where("chatId", "==", chatId));

    const unsub = onSnapshot(q, (snapshot) => {
        if (!initialLoadDone) {
            const msgs = [];
            snapshot.forEach(docSnap => {
                msgs.push({ id: docSnap.id, data: docSnap.data() });
                renderedIds.add(docSnap.id);
            });

            msgs.sort((a, b) => {
                const ta = a.data.createdAt?.toMillis?.() ?? Date.now();
                const tb = b.data.createdAt?.toMillis?.() ?? Date.now();
                return ta - tb;
            });

            msgs.forEach(({ id, data }) => {
                const el = buildMsgEl(data, false);
                el.dataset.msgId = id;
                chatWindow.appendChild(el);
            });

            chatWindow.scrollTop = chatWindow.scrollHeight;
            initialLoadDone = true;

        } else {
            let needsScroll = false;

            snapshot.docChanges().forEach(change => {
                const msg   = change.doc.data();
                const docId = change.doc.id;

                if ((change.type === "added" || change.type === "modified") && !renderedIds.has(docId)) {
                    renderedIds.add(docId);
                    const el = buildMsgEl(msg, true);
                    el.dataset.msgId = docId;
                    chatWindow.appendChild(el);
                    needsScroll = true;
                } else if (change.type === "removed") {
                    renderedIds.delete(docId);
                    const existing = chatWindow.querySelector(`[data-msg-id="${docId}"]`);
                    if (existing) existing.remove();
                }
            });

            if (needsScroll) chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }, (error) => {
        console.error("Ошибка onSnapshot:", error);
    });

    setUnsubscribeChat(unsub);
}

// ===== ОТПРАВКА ТЕКСТА =====
async function sendMessage() {
    import('./state.js').then(async state => {
        const text = msgInput.value.trim();
        if (!text || !state.currentChatId) return;
        msgInput.value = "";

        try {
            await addDoc(messagesRef, {
                deviceId:  deviceId,
                name:      state.myName,
                avatar:    state.myAvatar,
                text:      text,
                chatId:    state.currentChatId,
                createdAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Ошибка отправки:", e);
        }
    });
}

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// ===== ОТПРАВКА ФОТО =====
imageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];

    import('./state.js').then(state => {
        if (!file || !state.currentChatId) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    const canvas  = document.createElement("canvas");
                    const ctx     = canvas.getContext("2d");
                    const maxSize = 1280;

                    let width  = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxSize) { height *= maxSize / width; width = maxSize; }
                    } else {
                        if (height > maxSize) { width *= maxSize / height; height = maxSize; }
                    }

                    canvas.width  = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedImage = canvas.toDataURL("image/jpeg", 0.7);

                    await addDoc(messagesRef, {
                        deviceId:  deviceId,
                        name:      state.myName,
                        avatar:    state.myAvatar,
                        image:     compressedImage,
                        chatId:    state.currentChatId,
                        createdAt: serverTimestamp()
                    });
                } catch (e) {
                    console.error("Ошибка отправки фото:", e);
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
});

// ===== РАСКРЫТИЕ ФОТО =====
window.togglePhoto = function(preview) {
    const img = preview.nextElementSibling;
    img.classList.toggle('open');
};

// ===== УДАЛЕНИЕ ЧАТА =====
export async function confirmDeleteChat(chatId, onDone) {
    if (!chatId) return;

    try {
        const q     = query(messagesRef, where("chatId", "==", chatId));
        const unsub = onSnapshot(q, async (snapshot) => {
            for (const docSnap of snapshot.docs) {
                await deleteDoc(docSnap.ref);
            }
            unsub();
        });

        setTimeout(onDone, 500);
    } catch (e) {
        console.error("Ошибка удаления чата:", e);
    }
}
