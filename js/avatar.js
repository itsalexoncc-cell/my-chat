import { db, setDoc, doc, serverTimestamp } from './config.js';
import { deviceId, myName, myUsername, setMyAvatar } from './state.js';
import { updateHeader } from './ui.js';

const fileInput = document.getElementById("file-input");

// ===== КЛИК ПО АВАТАРУ В ШАПКЕ =====
window.handleAvatarClick = function() {
    import('./state.js').then(state => {
        if (state.isInChatsList) fileInput.click();
    });
};

// ===== СМЕНА АВАТАРА =====
fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx    = canvas.getContext("2d");
            const size   = 256;

            canvas.width  = size;
            canvas.height = size;

            const minSide = Math.min(img.width, img.height);
            const sx = (img.width  - minSide) / 2;
            const sy = (img.height - minSide) / 2;

            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

            const newAvatar = canvas.toDataURL("image/jpeg", 0.7);

            setMyAvatar(newAvatar);
            localStorage.setItem("chat_avatar", newAvatar);
            updateHeader('me');

            try {
                import('./state.js').then(async state => {
                    await setDoc(doc(db, "users", deviceId), {
                        deviceId:  deviceId,
                        name:      state.myName,
                        username:  state.myUsername,
                        avatar:    newAvatar,
                        updatedAt: serverTimestamp()
                    });
                });
            } catch (e) {
                console.error("Ошибка обновления аватара:", e);
            }
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});
