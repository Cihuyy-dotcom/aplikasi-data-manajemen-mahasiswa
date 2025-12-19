import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBFJkOThg9i41v9fiI68rOYc74oilVHg4",
    authDomain: "aplikasi-data-mahasiswa-c84ab.firebaseapp.com",
    databaseURL: "https://aplikasi-data-mahasiswa-c84ab-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aplikasi-data-mahasiswa-c84ab",
    storageBucket: "aplikasi-data-mahasiswa-c84ab.firebasestorage.app",
    messagingSenderId: "1052616248736",
    appId: "1:1052616248736:web:8509b1945ae2184d59e8c5",
    measurementId: "G-WLPLBRX4PL"
};

console.log("Sistem: Memulai Inisialisasi Firebase...");
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const dbRef = ref(db, 'mahasiswa');

// Elemen UI
const loginSection = document.getElementById('loginSection');
const mainDashboard = document.getElementById('mainDashboard');

// ==========================================
// MONITOR STATUS LOGIN (DIBERIKAN LOG)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Sistem: User Terdeteksi!", user.email);
        loginSection.style.setProperty('display', 'none', 'important');
        mainDashboard.style.setProperty('display', 'block', 'important');
        initDatabase();
    } else {
        console.log("Sistem: Tidak ada user login.");
        loginSection.style.setProperty('display', 'block', 'important');
        mainDashboard.style.setProperty('display', 'none', 'important');
    }
});

// Proses Login
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log("Sistem: Mencoba Login...");
    signInWithEmailAndPassword(auth, email, password)
        .then(() => console.log("Sistem: Login Berhasil!"))
        .catch(err => {
            console.error("Sistem Error:", err.code);
            alert("Gagal Masuk: " + err.message);
        });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

// --- (Sisanya kode OOP, Sorting, dan CRUD tetap sama) ---
// Pastikan fungsi initDatabase() dan class Mahasiswa ada di bawah sini seperti sebelumnya
