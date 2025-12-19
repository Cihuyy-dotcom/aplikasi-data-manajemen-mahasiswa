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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const dbRef = ref(db, 'mahasiswa');

// ==========================================
// KONSEP OOP: CLASS MAHASISWA
// ==========================================
class Mahasiswa {
    #nim; // Enkapsulasi: Private Property
    constructor(id, nama, nim, jurusan) {
        this.id = id;
        this.nama = nama;
        this.#nim = nim;
        this.jurusan = jurusan;
    }
    getNim() { return this.#nim; }
}

class ManajemenMahasiswa {
    constructor() { this.data = []; }

    // Estimasi Time Complexity: O(n^2)
    bubbleSort() {
        let n = this.data.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (this.data[j].nama.toLowerCase() > this.data[j + 1].nama.toLowerCase()) {
                    [this.data[j], this.data[j + 1]] = [this.data[j + 1], this.data[j]];
                }
            }
        }
    }
}

const manager = new ManajemenMahasiswa();
let editId = null;

// ==========================================
// AUTHENTICATION & UI LOGIC
// ==========================================
const loginSection = document.getElementById('loginSection');
const mainDashboard = document.getElementById('mainDashboard');

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = 'none';
        mainDashboard.style.display = 'block';
        initDatabase();
    } else {
        loginSection.style.display = 'block';
        mainDashboard.style.display = 'none';
    }
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    signInWithEmailAndPassword(auth, email, password).catch(err => alert("Login Gagal: " + err.message));
});

document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

// ==========================================
// CRUD & VALIDATION (TRY-CATCH & REGEX)
// ==========================================
function validate(nama, nim) {
    const nameRegex = /^[a-zA-Z\s]{3,30}$/;
    const nimRegex = /^[0-9]{5,20}$/;
    if (!nameRegex.test(nama)) throw new Error("Nama harus huruf (3-30 karakter)!");
    if (!nimRegex.test(nim)) throw new Error("NIM harus angka!");
}

document.getElementById('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('name').value;
    const nim = document.getElementById('nim').value;
    const jurusan = document.getElementById('major').value;

    try {
        validate(nama, nim);
        if (editId === null) {
            push(dbRef, { nama, nim, jurusan });
        } else {
            update(ref(db, `mahasiswa/${editId}`), { nama, nim, jurusan });
            editId = null;
            document.getElementById('submitBtn').innerText = "Simpan";
        }
        document.getElementById('studentForm').reset();
    } catch (error) {
        alert(error.message); // Error Handling
    }
});

// ==========================================
// DISPLAY DATA & SORTING
// ==========================================
function initDatabase() {
    onValue(dbRef, (snapshot) => {
        const rawData = snapshot.val();
        manager.data = [];
        const tableBody = document.getElementById('studentTableBody');
        tableBody.innerHTML = '';

        if (rawData) {
            Object.keys(rawData).forEach(id => {
                const m = rawData[id];
                manager.data.push(new Mahasiswa(id, m.nama, m.nim, m.jurusan));
            });

            manager.bubbleSort(); // Fitur Bubble Sort Otomatis (A-Z)

            manager.data.forEach((m) => {
                const row = `<tr>
                    <td class="ps-4 fw-bold text-primary">${m.getNim()}</td>
                    <td>${m.nama}</td>
                    <td><span class="badge bg-light text-dark border">${m.jurusan}</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-warning me-1" onclick="editData('${m.id}', '${m.nama}', '${m.getNim()}', '${m.jurusan}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteData('${m.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
            });
            document.getElementById('totalStudents').innerText = manager.data.length;
        }
    });
}

// Global scope functions for buttons
window.deleteData = (id) => {
    if(confirm("Hapus data?")) remove(ref(db, `mahasiswa/${id}`));
}

window.editData = (id, nama, nim, jurusan) => {
    document.getElementById('name').value = nama;
    document.getElementById('nim').value = nim;
    document.getElementById('major').value = jurusan;
    editId = id;
    document.getElementById('submitBtn').innerText = "Update";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Searching (Linear Search)
document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const rows = document.getElementById('studentTableBody').getElementsByTagName('tr');
    for (let row of rows) {
        row.style.display = row.innerText.toLowerCase().includes(keyword) ? '' : 'none';
    }
});
