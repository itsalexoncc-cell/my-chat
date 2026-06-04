import {
    myName, myAvatar,
    currentContactUser, isInChatsList,
    setCurrentChatId, setCurrentContactUser, setIsInChatsList,
    unsubscribeChat, setUnsubscribeChat,
    unsubscribeAllChats
} from './state.js';

import { loadChat }      from './messages.js';
import { loadAllChats }  from './chats.js';

// ===== ЭЛЕМЕНТЫ =====
export const headerName        = document.getElementById("header-name");
export const avatarImg         = document.getElementById("avatar-img");
export const avatarPlaceholder = document.getElementById("avatar-placeholder");
export const deleteChatBtn     = document.getElementById("delete-chat-btn");
export const chatWindow        = document.getElementById("chat-window");
export const chatsList         = document.getElementById("chats-list");
export const inputArea         = document.getElementById("input-area");

// ===== ОБНОВЛЕНИЕ ШАПКИ =====
export function updateHeader(mode) {
    import('./state.js').then(state => {
        if (mode === 'contact' && state.currentContactUser) {
            if (state.currentContactUser.avatar) {
                avatarImg.src = state.currentContactUser.avatar;
                avatarImg.style.display = "block";
                avatarPlaceholder.style.display = "none";
            } else {
                avatarImg.style.display = "none";
                avatarPlaceholder.style.display = "flex";
                avatarPlaceholder.textContent = "👤";
            }
            headerName.textContent = state.currentContactUser.name || "Unknown";
            deleteChatBtn.classList.add("visible");
        } else {
            if (state.myAvatar) {
                avatarImg.src = state.myAvatar;
                avatarImg.style.display = "block";
                avatarPlaceholder.style.display = "none";
            } else {
                avatarImg.style.display = "none";
                avatarPlaceholder.style.display = "flex";
                avatarPlaceholder.textContent = "+";
            }
            headerName.textContent = state.myName || "Мой профиль";
            deleteChatBtn.classList.remove("visible");
        }
    });
}

// ===== ПОКАЗ СПИСКА ЧАТОВ =====
export function showChatsList() {
    setIsInChatsList(true);
    setCurrentChatId(null);
    setCurrentContactUser(null);

    import('./state.js').then(state => {
        if (state.unsubscribeChat) {
            state.unsubscribeChat();
            setUnsubscribeChat(null);
        }
    });

    chatWindow.classList.add("hidden");
    inputArea.classList.add("hidden");
    chatsList.classList.add("active");

    updateHeader('me');
    loadAllChats();
}

// ===== ПОКАЗ ЧАТА =====
export function showChat(chatId, contactUser) {
    setIsInChatsList(false);
    setCurrentChatId(chatId);
    setCurrentContactUser(contactUser);

    chatsList.classList.remove("active");
    chatWindow.classList.remove("hidden");
    inputArea.classList.remove("hidden");

    updateHeader('contact');

    chatWindow.innerHTML = "";
    loadChat(chatId);
}
