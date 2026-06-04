import { db, setDoc, doc, serverTimestamp, postsRef, query, where, onSnapshot } from './config.js';
import * as state from './state.js';
import { updateTopBar } from './ui.js';
import { updateProfileUI } from './registration.js';

const fileInput  = document.getElementById("file-input");
const photosGrid = document.getElementById("photos-grid");

// ===== СМЕНА АВАТАРА =====
fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
        const img = new Image();
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx    = canvas.getContext("2d");
            const size   = 256;
            canvas.width = canvas.height = size;
            const min = Math.min(img.width, img.height);
            const sx  = (img.width  - min) / 2;
            const sy  = (img.height - min) / 2;
            ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

            const avatar = canvas.toDataURL("image/jpeg", 0.7);
            state.setMyAvatar(avatar);
            localStorage.setItem("chat_avatar", avatar);

            updateTopBar();
            updateProfileUI();

            try {
                await setDoc(doc(db, "users", state.deviceId), {
                    deviceId:  state.deviceId,
                    name:      state.myName,
                    username:  state.myUsername,
                    avatar,
                    updatedAt: serverTimestamp()
                });
            } catch(e) { console.error(e); }
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// ===== ЗАГРУЗКА ФОТО В ПРОФИЛЬ =====
export function loadProfilePhotos() {
    // Пока пусто — можно добавить загрузку фото позже
    photosGrid.innerHTML = `<div class="photos-empty">Нет фотографий</div>`;
}

// Кнопка добавить фото в профиле — через input
document.getElementById("profile-big-avatar").addEventListener("click", () => {
    fileInput.click();
});
