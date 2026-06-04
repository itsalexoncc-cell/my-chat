import * as state from './state.js';
import { updateTopBar, switchTab } from './ui.js';
import { loadAllUsers, subscribeAllUsers } from './users.js';
import { loadFeed } from './feed.js';
import { loadChats } from './chats.js';
import { loadProfilePhotos } from './profile.js';
import { updateProfileUI } from './registration.js';

// Импортируем модули чтобы запустить их слушатели
import './messages.js';
import './profile.js';

async function init() {
    updateTopBar();
    updateProfileUI();

    await loadAllUsers();
    subscribeAllUsers();

    loadFeed();
    loadChats();
    loadProfilePhotos();

    // Показать первый таб
    window.switchTab("feed");
}

if (state.isFirstLaunch) {
    // Регистрация уже показана по умолчанию в HTML
    // после регистрации registration.js сам вызовет init
} else {
    document.getElementById("registration-screen").classList.add("hidden");
    init();
}
