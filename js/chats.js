import { messagesRef, query, orderBy, onSnapshot } from './config.js';
import * as state from './state.js';
import { setUnsubscribeAllChats } from './state.js';
import { showChat } from './ui.js';

const chatsListItems = document.getElementById("chats-list-items");

// ===== ЗАГРУЗКА ВСЕХ ЧАТОВ =====
export function loadAllChats() {
    chatsListItems.innerHTML = "";

    if (state.unsubscribeAllChats) {
        state.unsubscribeAllChats();
        setUnsubscribeAllChats(null);
    }

    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
        const chatMap = {};

        snapshot.forEach(docSnap => {
            const msg = docSnap.data();
            const cid = msg.chatId;
            if (!cid || !cid.includes(state.deviceId)) return;

            if (!chatMap[cid]) {
                const parts = cid.split("__");
                const contactDeviceId = parts[0] === state.deviceId ? parts[1] : parts[0];

                chatMap[cid] = {
                    chatId:          cid,
                    contactDeviceId: contactDeviceId,
                    lastMessage:     msg.text || "📷 Фото",
                    ts:              msg.createdAt
                };
            }
        });

        renderChatsList(chatMap);
    });

    setUnsubscribeAllChats(unsub);
}

// ===== РЕНДЕР СПИСКА ЧАТОВ =====
function renderChatsList(chatMap) {
    chatsListItems.innerHTML = "";

    if (Object.keys(chatMap).length === 0) {
        chatsListItems.innerHTML = `
            <div class="chats-empty">
                <div class="chats-empty-icon">💬</div>
                <div class="chats-empty-text">Нет чатов<br>Нажми + чтобы написать</div>
            </div>`;
        return;
    }

    for (const chatId in chatMap) {
        const chat        = chatMap[chatId];
        const contactUser = state.allUsers.find(u => u.deviceId === chat.contactDeviceId);

        const name   = contactUser ? contactUser.name   : chat.contactDeviceId.slice(0, 8) + "…";
        const avatar = contactUser ? contactUser.avatar : "";

        const contactObj = contactUser || {
            name:     name,
            avatar:   "",
            deviceId: chat.contactDeviceId
        };

        const el = document.createElement("div");
        el.className = "chat-item";
        el.innerHTML = `
            <div class="chat-item-avatar">
                ${avatar ? `<img src="${avatar}">` : '👤'}
            </div>
            <div class="chat-item-info">
                <div class="chat-item-name">${name}</div>
                <div class="chat-item-preview">${chat.lastMessage}</div>
            </div>`;
        el.onclick = () => showChat(chatId, contactObj);
        chatsListItems.appendChild(el);
    }
}

// ===== ДОБАВИТЬ ЧАТ В СПИСОК =====
export function addChatToList(chatId, user) {
    if (document.querySelector(`[data-chat-id="${chatId}"]`)) return;

    const empty = chatsListItems.querySelector(".chats-empty");
    if (empty) empty.remove();

    const el = document.createElement("div");
    el.className = "chat-item";
    el.dataset.chatId = chatId;
    el.innerHTML = `
        <div class="chat-item-avatar">
            ${user.avatar ? `<img src="${user.avatar}">` : '👤'}
        </div>
        <div class="chat-item-info">
            <div class="chat-item-name">${user.name}</div>
            <div class="chat-item-preview">Начать переписку…</div>
        </div>`;
    el.onclick = () => showChat(chatId, user);
    chatsListItems.prepend(el);
}
