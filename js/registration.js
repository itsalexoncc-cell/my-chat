import { db, setDoc, doc, serverTimestamp } from './config.js';
import * as state from './state.js';
import { updateTopBar, switchTab } from './ui.js';
import { loadAllUsers, subscribeAllUsers } from './users.js';
import { loadFeed } from './feed.js';
import { loadChats } from './chats.js';
import { loadProfilePhotos } from './profile.js';

// Обработчик клика кнопки регистрации
async function handleRegisterClick() {
    const regNameInput = document.getElementById("reg-name-input");
    const regUsernameInput = document.getElementById("reg-username-input");
    const regScreen = document.getElementById("registration-screen");
    const appShell = document.getElementById("app-shell");

    const name     = regNameInput.value.trim();
    const username = regUsernameInput.value.trim().toLowerCase().replace("@", "");

    console.log("Попытка регистрации:", { name, username });

    // Подсветить пустые поля
    regNameInput.style.borderColor     = !name     ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.15)";
    regUsernameInput.style.borderColor = !username ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.15)";

    if (!name || !username) {
        console.log("Поля не заполнены!");
        return;
    }

    try {
        // Сохраняем в состояние
        state.setMyName(name);
        state.setMyUsername(username);
        state.setMyAvatar("");

        // Сохраняем в localStorage
        localStorage.setItem("chat_name",     name);
        localStorage.setItem("chat_username", username);
        localStorage.setItem("chat_avatar",   "");

        console.log("Отправка в Firebase...");

        // Отправляем в Firebase
        await setDoc(doc(db, "users", state.deviceId), {
            deviceId:  state.deviceId,
            name,
            username,
            avatar:    "",
            updatedAt: serverTimestamp()
        });

        console.log("Регистрация успешна!");

        // Скрываем экран регистрации
        regScreen.classList.add("hidden");
        appShell.style.display = "flex";

        // Обновляем UI
        updateTopBar();
        updateProfileUI();

        // Загружаем данные и показываем ленту
        await loadAllUsers();
        subscribeAllUsers();
        loadFeed();
        loadChats();
        loadProfilePhotos();

        // Переключаемся на ленту
        switchTab("feed");

    } catch(e) { 
        console.error("Ошибка регистрации:", e); 
        alert("Ошибка: " + e.message);
    }
}

// Инициализация кнопки регистрации при загрузке DOM
function setupRegisterButton() {
    const regButton = document.getElementById("reg-button");
    if (regButton) {
        regButton.addEventListener("click", handleRegisterClick);
        console.log("✓ Обработчик клика кнопки зарегистрирован");
    } else {
        console.error("✗ Кнопка регистрации не найдена!");
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupRegisterButton);
} else {
    setupRegisterButton();
}

export function showRegistration() { 
    const regScreen = document.getElementById("registration-screen");
    if (regScreen) regScreen.classList.remove("hidden"); 
}

export function hideRegistration() { 
    const regScreen = document.getElementById("registration-screen");
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
