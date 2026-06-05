import { messagesRef, query, orderBy, onSnapshot, where, deleteDoc } from './config.js';
import * as state from './state.js';
import { setUnsubscribeChats } from './state.js';
import { openChat } from './ui.js';

const listEl = document.getElementById("chats-list-items");
const searchInput = document.getElementById("chats-search-input");

let pendingDeleteChatId = null;

export function loadChats() {
    if (state.unsubscribeChats) {
        state.unsubscribeChats();
        setUnsubscribeChats(null);
    }

    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, snapshot => {
        const chatMap = {};
        snapshot.forEach(docSnap => {
            const msg = docSnap.data();
            const cid = msg.chatId;
            if (!cid) return;
            const parts = cid.split("__");
            if (!parts.includes(state.deviceId)) return;

            if (!chatMap[cid]) {
                const contactDeviceId = parts[0] === state.deviceId ? parts[1] : parts[0];
                chatMap[cid] = {
                    chatId: cid,
                    contactDeviceId,
                    lastMessage: msg.text || "📷 Фото",
                };
            }
        });
        renderChats(chatMap);
    });

    setUnsubscribeChats(unsub);
}

function renderChats(chatMap) {
    const search = searchInput.value.toLowerCase();
    listEl.innerHTML = "";

    const entries = Object.values(chatMap);

    if (!entries.length) {
        listEl.innerHTML = `<div class="chats-empty"><div class="chats-empty-icon">💬</div><div class="chats-empty-text">Нет чатов<br>Нажми + чтобы написать</div></div>`;
        return;
    }

    entries.forEach(chat => {
        const user = state.allUsers.find(u => u.deviceId === chat.contactDeviceId);
        const name   = user ? user.name   : chat.contactDeviceId.slice(0, 8) + "…";
        const avatar = user ? user.avatar : "";
        const contactObj = user || { name, avatar: "", deviceId: chat.contactDeviceId };

        if (search && !name.toLowerCase().includes(search)) return;

        const wrap = document.createElement("div");
        wrap.className = "chat-item-wrap";
        wrap.dataset.chatId = chat.chatId;

        wrap.innerHTML = `
            <div class="chat-item-delete-bg">Удалить</div>
            <div class="chat-item">
                <div class="chat-item-avatar">
                    ${avatar ? `<img src="${avatar}">` : "👤"}
                </div>
                <div class="chat-item-info">
                    <div class="chat-item-name">${name}</div>
                    <div class="chat-item-preview">${chat.lastMessage}</div>
                </div>
            </div>`;

        const item = wrap.querySelector(".chat-item");
        item.onclick = () => openChat(chat.chatId, contactObj);

        // Свайп влево для удаления
        let startX = 0;
        let currentX = 0;
        let swiping = false;

        item.addEventListener("touchstart", e => {
            startX = e.touches[0].clientX;
            swiping = true;
        }, { passive: true });

        item.addEventListener("touchmove", e => {
            if (!swiping) return;
            currentX = e.touches[0].clientX - startX;
            if (currentX < 0) {
                item.style.transform = `translateX(${Math.max(currentX, -80)}px)`;
            }
        }, { passive: true });

        item.addEventListener("touchend", () => {
            swiping = false;
            if (currentX < -50) {
                item.style.transform = "translateX(-80px)";
                // Клик на bg удаляет
                wrap.querySelector(".chat-item-delete-bg").onclick = () => {
                    pendingDeleteChatId = chat.chatId;
                    document.getElementById("delete-modal").classList.add("active");
                };
            } else {
                item.style.transform = "translateX(0)";
            }
            currentX = 0;
        });

        listEl.appendChild(wrap);
    });
}

searchInput.addEventListener("input", () => {
    // Перезапустить рендер при поиске
    import('./chats.js').then(() => loadChats());
});

export function addChatToList(chatId, user) {
    if (listEl.querySelector(`[data-chat-id="${chatId}"]`)) return;
    const empty = listEl.querySelector(".chats-empty");
    if (empty) empty.remove();

    const wrap = document.createElement("div");
    wrap.className = "chat-item-wrap";
    wrap.dataset.chatId = chatId;
    wrap.innerHTML = `
        wrap.innerHTML = `
    <div class="chat-item-delete-bg">Удалить</div>
    <div class="chat-item">
        <div class="chat-item-preview">
            Начать переписку…
        </div>
        <div class="chat-item-avatar">
            ${user.avatar ? `<img src="${user.avatar}">` : "👤"}
        </div>
        <div class="chat-item-name">
            ${user.name}
        </div>
    </div>`;

    wrap.querySelector(".chat-item").onclick = () => openChat(chatId, user);
    listEl.prepend(wrap);
}

window.confirmDeleteChat = async () => {
    document.getElementById("delete-modal").classList.remove("active");
    if (!pendingDeleteChatId) return;

    const chatId = pendingDeleteChatId;
    pendingDeleteChatId = null;

    // Убрать из UI
    const wrap = listEl.querySelector(`[data-chat-id="${chatId}"]`);
    if (wrap) wrap.remove();

    // Удалить из Firebase
    try {
        const q = query(messagesRef, where("chatId", "==", chatId));
        const unsub = onSnapshot(q, async snapshot => {
            for (const d of snapshot.docs) await deleteDoc(d.ref);
            unsub();
        });
    } catch(e) { console.error(e); }
};
