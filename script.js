// 1. Tambahkan import Auth di sini
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
const auth = getAuth(app); // Inisialisasi Auth

// ==========================================
// 1. KONSEP OOP
// ==========================================
class Mahasiswa {
    #nim; 
    constructor(id, nama, nim, jurusan) {
        this.id = id; // Kita butuh ID untuk hapus/edit
        this.nama = nama;
        this.#nim = nim;
        this.jurusan = jurusan;
    }
    getNim() { return this.#nim; }
}

class ManajemenMahasiswa {
    constructor() { this.data = []; }

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

// ==========================================
// 2. LOGIKA LOGIN (Penyebab Web Tidak Terbuka)
// ==========================================
const loginSection = document.getElementById('loginSection');
const mainDashboard = document.getElementById('mainDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    signInWithEmailAndPassword(auth, email, password)
        .catch(error => alert("Login Gagal: " + error.message));
});

logoutBtn.addEventListener('click', () => signOut(auth));

// Pantau status login
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = 'none';
        mainDashboard.style.display = 'block';
        initDatabaseListener(); // Panggil data jika login sukses
    } else {
        loginSection.style.display = 'block';
        mainDashboard.style.display = 'none';
    }
});

// ==========================================
// 3. VALIDASI & CRUD
// ==========================================
function validasiData(nama, nim) {
    const nameRegex = /^[a-zA-Z\s]{3,30}$/;
    const nimRegex = /^[0-9]{5,15}$/; 

    if (!nameRegex.test(nama)) throw new Error("Nama harus huruf (3-30 karakter)!");
    if (!nimRegex.test(nim)) throw new Error("NIM harus angka!");
}

const studentForm = document.getElementById('studentForm');
let editId = null;

studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('name').value;
    const nim = document.getElementById('nim').value;
    const jurusan = document.getElementById('major').value;

    try {
        validasiData(nama, nim);
        if (editId === null) {
            push(ref(db, 'mahasiswa'), { nama, nim, jurusan });
        } else {
            update(ref(db, `mahasiswa/${editId}`), { nama, nim, jurusan });
            editId = null;
            document.getElementById('submitBtn').innerText = "Simpan";
        }
        studentForm.reset();
    } catch (error) {
        alert(error.message);
    }
});

// ==========================================
// 4. DISPLAY DATA
// ==========================================
function initDatabaseListener() {
    onValue(ref(db, 'mahasiswa'), (snapshot) => {
        const rawData = snapshot.val();
        manager.data = [];
        const tableBody = document.getElementById('studentTableBody');
        tableBody.innerHTML = '';

        if (rawData) {
            Object.keys(rawData).forEach(id => {
                const m = rawData[id];
                manager.data.push(new Mahasiswa(id, m.nama, m.nim, m.jurusan));
            });

            manager.bubbleSort(); // Fitur Sorting Otomatis

            manager.data.forEach((mhs) => {
                const row = `<tr>
                    <td class="ps-4">${mhs.getNim()}</td>
                    <td>${mhs.nama}</td>
                    <td>${mhs.jurusan}</td>
                    <td class="text-center">
                        <button class="btn-edit me-2" onclick="editData('${mhs.id}', '${mhs.nama}', '${mhs.getNim()}', '${mhs.jurusan}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete" onclick="deleteData('${mhs.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
            });
            document.getElementById('totalStudents').innerText = manager.data.length;
        }
    });
}

// Fungsi Global untuk Button
window.deleteData = (id) => {
    if(confirm("Hapus data?")) remove(ref(db, `mahasiswa/${id}`));
}

window.editData = (id, nama, nim, jurusan) => {
    document.getElementById('name').value = nama;
    document.getElementById('nim').value = nim;
    document.getElementById('major').value = jurusan;
    editId = id;
    document.getElementById('submitBtn').innerText = "Update Data";
}
