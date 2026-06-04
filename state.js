// ===== DEVICE ID =====
let deviceId = localStorage.getItem("device_id");
export const isFirstLaunch = !deviceId;

if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
}

export { deviceId };

// ===== ПРОФИЛЬ =====
export let myName     = localStorage.getItem("chat_name")     || "";
export let myUsername = localStorage.getItem("chat_username") || "";
export let myAvatar   = localStorage.getItem("chat_avatar")   || "";

export function setMyName(v)     { myName     = v; }
export function setMyUsername(v) { myUsername = v; }
export function setMyAvatar(v)   { myAvatar   = v; }

// ===== СОСТОЯНИЕ ЧАТА =====
export let currentChatId       = null;
export let currentContactUser  = null;
export let isInChatsList       = true;
export let allUsers            = [];
export let unsubscribeChat     = null;
export let unsubscribeAllChats = null;

export function setCurrentChatId(v)       { currentChatId       = v; }
export function setCurrentContactUser(v)  { currentContactUser  = v; }
export function setIsInChatsList(v)       { isInChatsList       = v; }
export function setAllUsers(v)            { allUsers            = v; }
export function setUnsubscribeChat(v)     { unsubscribeChat     = v; }
export function setUnsubscribeAllChats(v) { unsubscribeAllChats = v; }
