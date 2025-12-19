import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- KONFIGURASI FIREBASE ---
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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const dbRef = ref(db, 'mahasiswa');

// Elemen UI
const loginSection = document.getElementById('loginSection');
const mainDashboard = document.getElementById('mainDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const studentForm = document.getElementById('studentForm');
const studentTableBody = document.getElementById('studentTableBody');
const totalElement = document.getElementById('totalStudents');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('searchInput');

let editId = null;

// ==========================================
// 1. LOGIKA AUTENTIKASI (LOGIN/LOGOUT)
// ==========================================

// Proses Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            loginForm.reset();
            console.log("Login berhasil");
        })
        .catch(err => alert("Login Gagal: " + err.message));
});

// Proses Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log("Berhasil keluar");
    });
});

// Pantau Status Login (Session)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Jika login sukses
        loginSection.style.display = 'none';
        mainDashboard.style.display = 'block';
        initRealtimeDatabase(); // Aktifkan listener database
    } else {
        // Jika belum login / logout
        loginSection.style.display = 'block';
        mainDashboard.style.display = 'none';
    }
});


// ==========================================
// 2. LOGIKA DATABASE (CRUD & SORTING)
// ==========================================

function initRealtimeDatabase() {
    onValue(dbRef, (snapshot) => {
        studentTableBody.innerHTML = '';
        const data = snapshot.val();
        
        if (data) {
            // KONVERSI OBJEK KE ARRAY UNTUK SORTING
            const studentArray = Object.keys(data).map(id => {
                return { id, ...data[id] };
            });

            // LOGIKA SORTING OTOMATIS (Berdasarkan Nama A-Z)
            studentArray.sort((a, b) => a.name.localeCompare(b.name));

            // Update Total Angka
            totalElement.innerText = studentArray.length;

            // Render ke Tabel
            studentArray.forEach((s) => {
                const row = `
                    <tr>
                        <td class="ps-4 fw-bold text-primary">${s.nim}</td>
                        <td class="fw-semibold">${s.name}</td>
                        <td><span class="badge bg-light text-dark border">${s.major}</span></td>
                        <td class="text-center">
                            <button class="btn-edit me-2" onclick="editData('${s.id}', '${s.name}', '${s.nim}', '${s.major}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" onclick="deleteData('${s.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>`;
                studentTableBody.innerHTML += row;
            });
        } else {
            totalElement.innerText = "0";
            studentTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-muted">Belum ada data mahasiswa</td></tr>`;
        }
    });
}

// Simpan atau Update Data
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const nim = document.getElementById('nim').value;
    const major = document.getElementById('major').value;

    if (editId === null) {
        // Tambah Data Baru
        push(dbRef, { name, nim, major });
    } else {
        // Simpan Perubahan (Update)
        update(ref(db, 'mahasiswa/' + editId), { name, nim, major });
        editId = null;
        submitBtn.innerText = "Simpan";
    }
    studentForm.reset();
});


// ==========================================
// 3. FUNGSI GLOBAL (DAPAT DIAKSES OLEH HTML)
// ==========================================

window.deleteData = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        remove(ref(db, 'mahasiswa/' + id));
    }
};

window.editData = (id, name, nim, major) => {
    document.getElementById('name').value = name;
    document.getElementById('nim').value = nim;
    document.getElementById('major').value = major;
    
    editId = id;
    submitBtn.innerText = "Update Data";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Fitur Pencarian Real-time
searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const rows = studentTableBody.getElementsByTagName('tr');
    
    for (let row of rows) {
        const textContent = row.innerText.toLowerCase();
        row.style.display = textContent.includes(keyword) ? '' : 'none';
    }
});
