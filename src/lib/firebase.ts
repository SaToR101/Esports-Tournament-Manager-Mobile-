import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ДОБАВИЛИ ИМПОРТ АВТОРИЗАЦИИ
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAu93aK2m18sfrgwmtRedzjjw3zawTQ77g",
    authDomain: "esportsmanager-f2fb8.firebaseapp.com",
    projectId: "esportsmanager-f2fb8",
    storageBucket: "esportsmanager-f2fb8.firebasestorage.app",
    messagingSenderId: "163598371226",
    appId: "1:163598371226:web:4d87c7fa9028492d42d223"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// ЭКСПОРТИРУЕМ МОДУЛЬ АВТОРИЗАЦИИ
export const auth = getAuth(app);