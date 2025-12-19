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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const dbRef = ref(db, 'mahasiswa');

// Elements
const loginSection = document.getElementById('loginSection');
const mainDashboard = document.getElementById('mainDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const studentForm = document.getElementById('studentForm');
const studentTableBody = document.getElementById('studentTableBody');
const totalElement = document.getElementById('totalStudents');
const submitBtn = document.getElementById('submitBtn');

let editId = null;

// --- A. AUTHENTICATION LOGIC ---

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => loginForm.reset())
        .catch(err => alert("Login Gagal: " + err.message));
});

// Logout
logoutBtn.addEventListener('click', () => signOut(auth));

// Pantau Status Login
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = 'none';
        mainDashboard.style.display = 'block';
        loadData(); // Load data hanya jika login
    } else {
        loginSection.style.display = 'block';
        mainDashboard.style.display = 'none';
    }
});

// --- B. DATABASE LOGIC (CRUD) ---

function loadData() {
    onValue(dbRef, (snapshot) => {
        studentTableBody.innerHTML = '';
        const data = snapshot.val();
        
        if (data) {
            const count = Object.keys(data).length;
            totalElement.innerText = count;

            Object.keys(data).forEach((id) => {
                const s = data[id];
                const row = `
                    <tr>
                        <td class="ps-4 fw-bold text-primary">${s.nim}</td>
                        <td class="fw-semibold">${s.name}</td>
                        <td><span class="badge bg-light text-dark border">${s.major}</span></td>
                        <td class="text-center">
                            <button class="btn-edit me-2" onclick="editData('${id}', '${s.name}', '${s.nim}', '${s.major}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" onclick="deleteData('${id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
                studentTableBody.innerHTML += row;
            });
        } else {
            totalElement.innerText = "0";
            studentTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-3">Tidak ada data</td></tr>`;
        }
    });
}

studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const nim = document.getElementById('nim').value;
    const major = document.getElementById('major').value;

    if (editId === null) {
        push(dbRef, { name, nim, major });
    } else {
        update(ref(db, 'mahasiswa/' + editId), { name, nim, major });
        editId = null;
        submitBtn.innerText = "Simpan";
    }
    studentForm.reset();
});

// Functions for buttons (Global Scope)
window.deleteData = (id) => {
    if (confirm("Hapus data ini?")) remove(ref(db, 'mahasiswa/' + id));
};

window.editData = (id, name, nim, major) => {
    document.getElementById('name').value = name;
    document.getElementById('nim').value = nim;
    document.getElementById('major').value = major;
    editId = id;
    submitBtn.innerText = "Update Data";
    window.scrollTo(0, 0);
};

// Fitur Cari
document.getElementById('searchInput').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const rows = studentTableBody.getElementsByTagName('tr');
    for (let row of rows) {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(val) ? '' : 'none';
    }
});
