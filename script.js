// --- CONFIG FIREBASE KAMU SUDAH BENAR ---
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'mahasiswa');

const studentForm = document.getElementById('studentForm');
const studentTableBody = document.getElementById('studentTableBody');
const submitBtn = document.getElementById('submitBtn');
const totalElement = document.getElementById('totalStudents'); // Tambahkan ini!

let editId = null;

// --- 1. AMBIL DATA SECARA REAL-TIME ---
onValue(dbRef, (snapshot) => {
    studentTableBody.innerHTML = '';
    const data = snapshot.val();
    
    // Update Total Mahasiswa
    if (data) {
        const count = Object.keys(data).length;
        if(totalElement) totalElement.innerText = count;

        // Render Tabel
        Object.keys(data).forEach((id) => {
            const student = data[id];
            const row = `
                <tr>
                    <td class="ps-4 fw-bold text-primary">${student.nim}</td>
                    <td><div class="fw-semibold">${student.name}</div></td>
                    <td><span class="badge bg-light text-dark border">${student.major}</span></td>
                    <td class="text-center">
                        <button class="btn-edit me-2" onclick="editData('${id}', '${student.name}', '${student.nim}', '${student.major}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete" onclick="deleteData('${id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            studentTableBody.innerHTML += row;
        });
    } else {
        if(totalElement) totalElement.innerText = "0";
        studentTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">Belum ada data</td></tr>`;
    }
});

// --- 2. SIMPAN / UPDATE DATA ---
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
        submitBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Simpan';
    }
    studentForm.reset();
});

// --- FUNGSI GLOBAL UNTUK BUTTON ---
window.deleteData = (id) => {
    if (confirm("Hapus data ini?")) {
        remove(ref(db, 'mahasiswa/' + id));
    }
};

window.editData = (id, name, nim, major) => {
    document.getElementById('name').value = name;
    document.getElementById('nim').value = nim;
    document.getElementById('major').value = major;
    editId = id;
    submitBtn.innerHTML = '<i class="fas fa-save me-1"></i> Update Data';
    window.scrollTo(0, 0);
};