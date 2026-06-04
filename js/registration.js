import { db, setDoc, doc, serverTimestamp } from './config.js';
import * as state from './state.js';
import { updateTopBar } from './ui.js';
import { loadAllUsers, subscribeAllUsers } from './users.js';
import { loadFeed } from './feed.js';
import { loadChats } from './chats.js';
import { loadProfilePhotos } from './profile.js';

const regScreen        = document.getElementById("registration-screen");
const regNameInput     = document.getElementById("reg-name-input");
const regUsernameInput = document.getElementById("reg-username-input");
const regButton        = document.getElementById("reg-button");

// Кнопка всегда активна
regButton.disabled = false;

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

export function showRegistration() { regScreen.classList.remove("hidden"); }
export function hideRegistration() { regScreen.classList.add("hidden"); }

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
