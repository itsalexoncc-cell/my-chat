/* ===== MAIN ENTRY POINT ===== */
// Точка входа, init()

// Инициализация приложения
async function init() {
    try {
        console.log('Инициализация приложения...');

        // Проверить регистрацию
        const myName = localStorage.getItem('myName');

        if (!myName) {
            showRegistrationScreen();
            setupRegistrationHandlers();
            return;
        }

        // Загрузить данные текущего пользователя
        currentUser.name = myName;
        currentUser.avatar = localStorage.getItem('myAvatar') || '';
        currentUser.username = localStorage.getItem('myUsername') || '';

        // Загрузить список всех пользователей
        await loadAllUsers();
        subscribeAllUsers();

        // Загрузить чаты
        await loadAllChats();
        subscribeChats();

        // Показать список чатов
        showChatsList();
        updateHeader();

        // Установить обработчики событий
        setupUIHandlers();
        setupUserSearchHandler();
        setupMessageHandlers();

        hideRegistrationScreen();
        isRegistered = true;

        console.log('Приложение инициализировано');
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }
}

// Установить обработчики UI
function setupUIHandlers() {
    // Кнопка назад
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showChatsList();
            updateHeader();
        });
    }

    // Кнопка удаления чата
    const deleteChatBtn = document.getElementById('delete-chat-btn');
    if (deleteChatBtn) {
        deleteChatBtn.addEventListener('click', () => {
            if (currentChatData) {
                showModal(
                    'Удалить чат?',
                    `Вы уверены, что хотите удалить чат с ${currentChatData.name}?`,
                    () => deleteChat(currentChatId)
                );
            }
        });
    }

    // Кнопка нового чата
    const newChatBtn = document.querySelector('.new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            showFindUserScreen();
        });
    }

    // Кнопка закрытия поиска
    const findBackBtn = document.querySelector('.find-back-btn');
    if (findBackBtn) {
        findBackBtn.addEventListener('click', () => {
            hideFindUserScreen();
            document.querySelector('.find-search-input').value = '';
            renderFindUserResults([]);
        });
    }

    // Аватар в шапке
    const avatarContainer = document.getElementById('avatar-container');
    const fileInput = document.getElementById('file-input');
    
    if (avatarContainer && fileInput) {
        avatarContainer.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const avatarUrl = await uploadAvatar(file);
                localStorage.setItem('myAvatar', avatarUrl);
                currentUser.avatar = avatarUrl;
                updateHeader();
            }
        });
    }

    // Закрытие модального окна по клику на фон
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
    }
}

// Обработчик выхода из приложения
window.addEventListener('beforeunload', () => {
    // Отписаться от всех подписок
    subscriptions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    });
});

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    init();
});
