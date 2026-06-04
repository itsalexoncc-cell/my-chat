import { usersRef, onSnapshot } from './config.js';
import {
    deviceId, isInChatsList,
    currentContactUser,
    setAllUsers, allUsers,
    setCurrentContactUser
} from './state.js';
import { updateHeader } from './ui.js';
import { showChat } from './ui.js';

// ===== ЭЛЕМЕНТЫ =====
const findUserScreen  = document.getElementById("find-user-screen");
const findSearchInput = document.getElementById("find-search-input");
const findUserContent = document.getElementById("find-user-content");

// ===== ПОДПИСКА НА ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (REALTIME) =====
export function subscribeAllUsers() {
    onSnapshot(usersRef, (snapshot) => {
        const users = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (docSnap.id !== deviceId) {
                users.push({
                    id:       docSnap.id,
                    deviceId: docSnap.id,
                    name:     data.name     || "Unknown",
                    username: (data.username || "").toLowerCase(),
                    avatar:   data.avatar   || ""
                });
            }
        });
        setAllUsers(users);

        import('./state.js').then(state => {
            if (!state.isInChatsList && state.currentContactUser) {
                const fresh = users.find(u => u.deviceId === state.currentContactUser.deviceId);
                if (fresh) {
                    setCurrentContactUser(fresh);
                    updateHeader('contact');
                }
            }
        });
    });
}

// ===== ЗАГРУЗКА ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (ОДИН РАЗ) =====
export function loadAllUsers() {
    return new Promise(resolve => {
        const unsub = onSnapshot(usersRef, (snapshot) => {
            const users = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (docSnap.id !== deviceId) {
                    users.push({
                        id:       docSnap.id,
                        deviceId: docSnap.id,
                        name:     data.name     || "Unknown",
                        username: (data.username || "").toLowerCase(),
                        avatar:   data.avatar   || ""
                    });
                }
            });
            setAllUsers(users);
            unsub();
            resolve();
        });
    });
}

// ===== ПОИСК ПОЛЬЗОВАТЕЛЯ =====
window.openFindUserScreen = async function() {
    await loadAllUsers();
    findUserScreen.classList.add("active");
    findSearchInput.value = "";
    displayUserSearchResults("");
    setTimeout(() => findSearchInput.focus(), 100);
};

window.closeFindUserScreen = function() {
    findUserScreen.classList.remove("active");
};

findSearchInput.addEventListener("input", (e) => {
    displayUserSearchResults(e.target.value);
});

function displayUserSearchResults(searchQuery) {
    findUserContent.innerHTML = "";

    if (searchQuery.length === 0) {
        findUserContent.innerHTML = `
            <div class="find-user-empty">
                <div class="find-user-empty-icon">🔍</div>
                <div class="find-user-empty-text">Введи юзернейм</div>
            </div>`;
        return;
    }

    import('./state.js').then(state => {
        const q        = searchQuery.toLowerCase().replace("@", "");
        const filtered = state.allUsers.filter(u =>
            u.username.includes(q) || u.name.toLowerCase().includes(q)
        );

        if (filtered.length === 0) {
            findUserContent.innerHTML = `
                <div class="find-user-empty">
                    <div class="find-user-empty-icon">😕</div>
                    <div class="find-user-empty-text">Юзернейм не найден</div>
                </div>`;
            return;
        }

        filtered.forEach(user => {
            const el = document.createElement("div");
            el.className = "user-search-result";
            el.innerHTML = `
                <div class="user-avatar-small">
                    ${user.avatar ? `<img src="${user.avatar}">` : '👤'}
                </div>
                <div class="user-info-small">
                    <div class="user-name-small">${user.name}</div>
                    <div class="user-username">@${user.username}</div>
                </div>`;
            el.onclick = () => startChatWithUser(user);
            findUserContent.appendChild(el);
        });
    });
}

// ===== НАЧАТЬ ЧАТ =====
function startChatWithUser(user) {
    const chatId = [deviceId, user.deviceId].sort().join("__");
    window.closeFindUserScreen();

    import('./chats.js').then(m => m.addChatToList(chatId, user));
    showChat(chatId, user);
}
