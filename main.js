import { isFirstLaunch }               from './state.js';
import { updateHeader, showChatsList } from './ui.js';
import { loadAllUsers, subscribeAllUsers } from './users.js';
import { showRegistration }            from './registration.js';
import { confirmDeleteChat }           from './messages.js';

// ===== ИМПОРТ МОДУЛЕЙ (запускают свои слушатели) =====
import './registration.js';
import './avatar.js';
import './users.js';

// ===== КНОПКА НАЗАД =====
document.getElementById("back-btn").addEventListener("click", () => {
    showChatsList();
});

// ===== КНОПКА УДАЛИТЬ ЧАТ =====
const deleteChatBtn = document.getElementById("delete-chat-btn");
const deleteModal   = document.getElementById("delete-modal");

deleteChatBtn.addEventListener("click", () => {
    deleteModal.classList.add("active");
});

window.confirmDeleteChat = async () => {
    deleteModal.classList.remove("active");

    import('./state.js').then(state => {
        confirmDeleteChat(state.currentChatId, () => {
            showChatsList();
        });
    });
};

// ===== СТАРТ =====
async function init() {
    await loadAllUsers();
    subscribeAllUsers();
    showChatsList();
}

if (isFirstLaunch) {
    showRegistration();
    updateHeader('me');
} else {
    updateHeader('me');
    init();
}
