import { db, setDoc, doc, serverTimestamp } from './config.js';
import { deviceId, setMyName, setMyUsername, setMyAvatar } from './state.js';
import { updateHeader } from './ui.js';
import { loadAllUsers, subscribeAllUsers } from './users.js';
import { showChatsList } from './ui.js';

// ===== ЭЛЕМЕНТЫ =====
const registrationScreen    = document.getElementById("registration-screen");
const regNameInput          = document.getElementById("reg-name-input");
const regUsernameInput      = document.getElementById("reg-username-input");
const regFileInput          = document.getElementById("reg-file-input");
const regAvatarImg          = document.getElementById("reg-avatar-img");
const regAvatarPlaceholder  = document.getElementById("reg-avatar-placeholder");
const regButton             = document.getElementById("reg-button");

// ===== ВАЛИДАЦИЯ =====
function validateRegistration() {
    const name     = regNameInput.value.trim();
    const username = regUsernameInput.value.trim();
    const isValid  = name.length > 0 && username.length > 0;
    regButton.disabled = !isValid;
    regButton.style.opacity = isValid ? "1" : "0.6";
}

regNameInput.addEventListener("input", validateRegistration);
regUsernameInput.addEventListener("input", validateRegistration);
regFileInput.addEventListener("change", validateRegistration);
validateRegistration();

// ===== ЗАГРУЗКА ФОТО =====
regFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx    = canvas.getContext("2d");
            const size   = 256;

            canvas.width  = size;
            canvas.height = size;

            const minSide = Math.min(img.width, img.height);
            const sx = (img.width  - minSide) / 2;
            const sy = (img.height - minSide) / 2;

            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

            const compressedAvatar = canvas.toDataURL("image/jpeg", 0.7);
            regAvatarImg.src = compressedAvatar;
            regAvatarImg.style.display = "block";
            regAvatarPlaceholder.style.display = "none";

            validateRegistration();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// ===== КНОПКА НАЧАТЬ =====
regButton.addEventListener("click", async () => {
    const name     = regNameInput.value.trim();
    const username = regUsernameInput.value.trim();
    if (!name || !username) return;

    const avatar = regAvatarImg.style.display === "block" ? regAvatarImg.src : "";

    setMyName(name);
    setMyUsername(username.toLowerCase().replace("@", ""));
    setMyAvatar(avatar);

    localStorage.setItem("chat_name",     name);
    localStorage.setItem("chat_username", username.toLowerCase().replace("@", ""));
    localStorage.setItem("chat_avatar",   avatar);

    try {
        await setDoc(doc(db, "users", deviceId), {
            deviceId:  deviceId,
            name:      name,
            username:  username.toLowerCase().replace("@", ""),
            avatar:    avatar,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Ошибка сохранения профиля:", e);
    }

    registrationScreen.classList.add("hidden");
    updateHeader('me');

    await loadAllUsers();
    subscribeAllUsers();
    showChatsList();
});

// ===== ПОКАЗ/СКРЫТИЕ ЭКРАНА =====
export function showRegistration() {
    registrationScreen.classList.remove("hidden");
}

export function hideRegistration() {
    registrationScreen.classList.add("hidden");
}
