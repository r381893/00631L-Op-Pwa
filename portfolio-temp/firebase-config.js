/**
 * Firebase 設定
 */
const firebaseConfig = {
    apiKey: "AIzaSyAeWAvPNdjDW_BM8QX0shEP59ge53tIkxU",
    authDomain: "portfolio-dafc3.firebaseapp.com",
    databaseURL: "https://portfolio-dafc3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "portfolio-dafc3",
    storageBucket: "portfolio-dafc3.firebasestorage.app",
    messagingSenderId: "662968059860",
    appId: "1:662968059860:web:0a468e9bd6b0b7cb06b841"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const projectsRef = database.ref('projects');
