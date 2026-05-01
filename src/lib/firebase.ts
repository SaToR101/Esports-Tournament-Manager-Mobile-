import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// Твои ключи от Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAu93aK2m18sfrgwmtRedzjjw3zawTQ77g",
    authDomain: "esportsmanager-f2fb8.firebaseapp.com",
    projectId: "esportsmanager-f2fb8",
    storageBucket: "esportsmanager-f2fb8.firebasestorage.app",
    messagingSenderId: "163598371226",
    appId: "1:163598371226:web:4d87c7fa9028492d42d223"
};

// Инициализируем приложение
const app = initializeApp(firebaseConfig);

// Подключаем текстовую базу данных Firestore
export const db = getFirestore(app);