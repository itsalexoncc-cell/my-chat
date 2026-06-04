import { db, setDoc, doc, serverTimestamp } from './config.js';
import * as state from './state.js';
import { updateTopBar } from './ui.js';
import { loadAllUsers, subscribeAllUsers } from './users.js';
import { loadFeed } from './feed.js';
import { loadChats } from './chats.js';
import { loadProfilePhotos } from './profile.js';

let regScreen, regNameInput, regUsernameInput, regButton;

function initRegistration() {
    regScreen        = document.getElementById("registration-screen");
    regNameInput     = document.getElementById("reg-name-input");
    regUsernameInput = document.getElementById("reg-username-input");
    regButton        = document.getElementById("reg-button");

    if (!regButton || !regNameInput || !regUsernameInput) {
        console.error("Registration elements not found!");
        return;
    }

    // Кнопка изначально неактивна
    regButton.disabled = true;

    // Проверяем поля при вводе
    function checkInputs() {
        const name     = regNameInput.value.trim();
        const username = regUsernameInput.value.trim();
        
        // Активируем кнопку только если оба поля заполнены
        regButton.disabled = !name || !username;
    }

    // Слушаем ввод в оба поля
    regNameInput.addEventListener("input", checkInputs);
    regUsernameInput.addEventListener("input", checkInputs);

    // Обработчик клика кнопки
    regButton.addEventListener("click", async () => {
        const name     = regNameInput.value.trim();
        const username = regUsernameInput.value.trim().toLowerCase().replace("@", "");

        // Подсветить пустые поля
        regNameInput.style.borderColor     = !name     ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.15)";
        regUsernameInput.style.borderColor = !username ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.15)";

        if (!name || !username) return;

        state.setMyName(name);
        state.setMyUsername(username);
        state.setMyAvatar("");

        localStorage.setItem("chat_name",     name);
        localStorage.setItem("chat_username", username);
        localStorage.setItem("chat_avatar",   "");

        try {
            await setDoc(doc(db, "users", state.deviceId), {
                deviceId:  state.deviceId,
                name,
                username,
                avatar:    "",
                updatedAt: serverTimestamp()
            });
        } catch(e) { console.error(e); }

        regScreen.classList.add("hidden");
        updateTopBar();
        updateProfileUI();

        await loadAllUsers();
        subscribeAllUsers();
        loadFeed();
        loadChats();
    });
}

export function showRegistration() { 
    if (regScreen) regScreen.classList.remove("hidden"); 
}

export function hideRegistration() { 
    if (regScreen) regScreen.classList.add("hidden"); 
}

export function updateProfileUI() {
    document.getElementById("profile-name-text").textContent     = state.myName;
    document.getElementById("profile-username-text").textContent = "@" + state.myUsername;

    const img = document.getElementById("profile-avatar-img");
    const ph  = document.getElementById("profile-avatar-placeholder");

    if (state.myAvatar) {
        img.src = state.myAvatar;
        img.style.display = "block";
        ph.style.display  = "none";
    } else {
        img.style.display = "none";
        ph.style.display  = "block";
    }
}

// Инициализируем при загрузке DOM
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRegistration);
} else {
    initRegistration();
}
