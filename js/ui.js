import * as state from './state.js';
import { setCurrentTab } from './state.js';

// ===== ЭЛЕМЕНТЫ =====
export const chatView    = document.getElementById("chat-view");
export const chatWindow  = document.getElementById("chat-window");
export const inputArea   = document.getElementById("input-area");
export const fabBtn      = document.getElementById("fab-btn");

const topAvatarImg         = document.getElementById("top-avatar-img");
const topAvatarPlaceholder = document.getElementById("top-avatar-placeholder");
const topName              = document.getElementById("top-name");

// ===== ОБНОВИТЬ ТОП-БАР =====
export function updateTopBar() {
    if (state.myAvatar) {
        topAvatarImg.src = state.myAvatar;
        topAvatarImg.style.display = "block";
        topAvatarPlaceholder.style.display = "none";
    } else {
        topAvatarImg.style.display = "none";
        topAvatarPlaceholder.style.display = "block";
    }
    topName.textContent = state.myName || "Chat";
}

// ===== ПЕРЕКЛЮЧЕНИЕ ТАБОВ =====
export function switchTab(tab) {
    setCurrentTab(tab);

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    document.getElementById(tab + "-screen").classList.add("active");
    document.getElementById("tab-" + tab).classList.add("active");

    // FAB логика
    if (tab === "feed") {
        fabBtn.style.display = "flex";
        fabBtn.textContent = "+";
        fabBtn.onclick = () => window.openPostModal();
    } else if (tab === "chats") {
        fabBtn.style.display = "flex";
        fabBtn.textContent = "+";
        fabBtn.onclick = () => window.openFindUserScreen();
    } else {
        fabBtn.style.display = "none";
    }
}

// Также сохраняем в window для использования в onclick
window.switchTab = switchTab;

// ===== ОТКРЫТЬ ЧАТ =====
export function openChat(chatId, contactUser) {
    state.setCurrentChatId(chatId);
    state.setCurrentContactUser(contactUser);

    // Обновить шапку чата
    const nameEl = document.getElementById("chat-contact-name");
    const avatarImg = document.getElementById("chat-contact-avatar-img");
    const avatarPlaceholder = document.getElementById("chat-contact-avatar-placeholder");

    nameEl.textContent = contactUser.name || "Unknown";

    if (contactUser.avatar) {
        avatarImg.src = contactUser.avatar;
        avatarImg.style.display = "block";
        avatarPlaceholder.style.display = "none";
    } else {
        avatarImg.style.display = "none";
        avatarPlaceholder.style.display = "block";
    }

    chatWindow.innerHTML = "";
    chatView.classList.add("open");
    inputArea.classList.remove("hidden");

    import('./messages.js').then(m => m.loadChat(chatId));
}

// ===== ЗАКРЫТЬ ЧАТ =====
window.closeChat = function() {
    chatView.classList.remove("open");
    inputArea.classList.add("hidden");

    if (state.unsubscribeChat) {
        state.unsubscribeChat();
        state.setUnsubscribeChat(null);
    }

    state.setCurrentChatId(null);
    state.setCurrentContactUser(null);
};
