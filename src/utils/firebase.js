/**
 * Firebase 設定與初始化
 */
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';

// Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyCuwjfBCY9xc0VK6zddUQHuiDQNEgnQz_Q",
    authDomain: "l-op-bf09b.firebaseapp.com",
    databaseURL: "https://l-op-bf09b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "l-op-bf09b",
    storageBucket: "l-op-bf09b.firebasestorage.app",
    messagingSenderId: "524848036456",
    appId: "1:524848036456:web:f8d9f2e3e914141f2519dd",
    measurementId: "G-GV6C805CGB"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 使用者 ID（可以之後換成登入功能）
// 目前使用固定 ID，讓所有裝置共用資料
const USER_ID = 'default-user';

/**
 * 儲存資料到 Firebase
 */
export async function saveToFirebase(data) {
    try {
        const dataRef = ref(database, `users/${USER_ID}/hedgeData`);
        await set(dataRef, {
            ...data,
            lastUpdated: new Date().toISOString()
        });
        console.log('✅ 已同步到雲端');
        return true;
    } catch (error) {
        console.error('❌ 雲端同步失敗:', error);
        return false;
    }
}

/**
 * 從 Firebase 讀取資料
 */
export async function loadFromFirebase() {
    try {
        const dataRef = ref(database, `users/${USER_ID}/hedgeData`);
        const snapshot = await get(dataRef);
        if (snapshot.exists()) {
            console.log('✅ 已從雲端載入資料');
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error('❌ 雲端讀取失敗:', error);
        return null;
    }
}

/**
 * 監聽 Firebase 資料變化（即時同步）
 */
export function subscribeToFirebase(callback) {
    const dataRef = ref(database, `users/${USER_ID}/hedgeData`);
    return onValue(dataRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    });
}

export { database };
