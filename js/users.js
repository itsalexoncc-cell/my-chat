import { usersRef, onSnapshot } from './config.js';
import * as state from './state.js';
import { openChat } from './ui.js';

const findScreen      = document.getElementById("find-user-screen");
const findSearchInput = document.getElementById("find-search-input");
const findContent     = document.getElementById("find-user-content");

export function subscribeAllUsers() {
    onSnapshot(usersRef, snapshot => {
        const users = [];
        snapshot.forEach(d => {
            if (d.id === state.deviceId) return;
            const data = d.data();
            users.push({
                id: d.id, deviceId: d.id,
                name:     data.name     || "Unknown",
                username: (data.username || "").toLowerCase(),
                avatar:   data.avatar   || ""
            });
        });
        state.setAllUsers(users);
    });
}

export function loadAllUsers() {
    return new Promise(resolve => {
        const unsub = onSnapshot(usersRef, snapshot => {
            const users = [];
            snapshot.forEach(d => {
                if (d.id === state.deviceId) return;
                const data = d.data();
                users.push({
                    id: d.id, deviceId: d.id,
                    name:     data.name     || "Unknown",
                    username: (data.username || "").toLowerCase(),
                    avatar:   data.avatar   || ""
                });
            });
            state.setAllUsers(users);
            unsub();
            resolve();
        });
    });
}

window.openFindUserScreen = async function() {
    await loadAllUsers();
    findScreen.classList.add("active");
    findSearchInput.value = "";
    renderResults("");
    setTimeout(() => findSearchInput.focus(), 100);
};

window.closeFindUserScreen = function() {
    findScreen.classList.remove("active");
};

findSearchInput.addEventListener("input", e => renderResults(e.target.value));

function renderResults(q) {
    findContent.innerHTML = "";
    if (!q) {
        findContent.innerHTML = `<div class="find-empty"><div class="find-empty-icon">🔍</div><div class="find-empty-text">Введи @username</div></div>`;
        return;
    }

    const term     = q.toLowerCase().replace("@", "");
    const filtered = state.allUsers.filter(u => u.username.includes(term) || u.name.toLowerCase().includes(term));

    if (!filtered.length) {
        findContent.innerHTML = `<div class="find-empty"><div class="find-empty-icon">😕</div><div class="find-empty-text">Не найдено</div></div>`;
        return;
    }

    filtered.forEach(user => {
        const el = document.createElement("div");
        el.className = "user-result";
        el.innerHTML = `
            <div class="user-result-avatar">
                ${user.avatar ? `<img src="${user.avatar}">` : "👤"}
            </div>
            <div>
                <div class="user-result-name">${user.name}</div>
                <div class="user-result-username">@${user.username}</div>
            </div>`;
        el.onclick = () => startChat(user);
        findContent.appendChild(el);
    });
}

function startChat(user) {
    const chatId = [state.deviceId, user.deviceId].sort().join("__");
    window.closeFindUserScreen();
    import('./chats.js').then(m => m.addChatToList(chatId, user));
    openChat(chatId, user);
}
