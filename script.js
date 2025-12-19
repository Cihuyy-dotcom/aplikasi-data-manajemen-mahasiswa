import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { /* ... config kamu ... */ };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 1. PENERAPAN KONSEP OOP (Class & Enkapsulasi)
// ==========================================
class Mahasiswa {
    #nim; // Private property (Enkapsulasi)
    constructor(nama, nim, jurusan) {
        this.nama = nama;
        this.#nim = nim;
        this.jurusan = jurusan;
    }
    getNim() { return this.#nim; }
}

class ManajemenMahasiswa {
    constructor() {
        this.data = []; // Penggunaan Array
    }

    // ==========================================
    // 2. FITUR PENGURUTAN (Minimal 2: Bubble & Selection Sort)
    // ==========================================
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

    // Estimasi Time Complexity: O(n^2)
    selectionSortByNim() {
        let n = this.data.length;
        for (let i = 0; i < n; i++) {
            let min = i;
            for (let j = i + 1; j < n; j++) {
                if (this.data[j].getNim() < this.data[min].getNim()) min = j;
            }
            [this.data[i], this.data[min]] = [this.data[min], this.data[i]];
        }
    }

    // ==========================================
    // 3. FITUR PENCARIAN (Linear Search)
    // ==========================================
    // Estimasi Time Complexity: O(n)
    linearSearch(keyword) {
        return this.data.filter(mhs => 
            mhs.nama.toLowerCase().includes(keyword.toLowerCase()) || 
            mhs.getNim().includes(keyword)
        );
    }
}

const manager = new ManajemenMahasiswa();

// ==========================================
// 4. VALIDASI INPUT (Regex) & ERROR HANDLING (Try-Catch)
// ==========================================
function validasiData(nama, nim) {
    const nameRegex = /^[a-zA-Z\s]{3,30}$/; // Hanya huruf, 3-30 karakter
    const nimRegex = /^[0-9]{8,12}$/;      // Hanya angka, 8-12 digit

    if (!nameRegex.test(nama)) throw new Error("Nama harus huruf (3-30 karakter)!");
    if (!nimRegex.test(nim)) throw new Error("NIM harus angka (8-12 digit)!");
}

// --- Operasi CRUD (Input, Edit, Hapus) ---
const studentForm = document.getElementById('studentForm');

studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('name').value;
    const nim = document.getElementById('nim').value;
    const jurusan = document.getElementById('major').value;

    try {
        validasiData(nama, nim); // Pemanggilan Regex
        // Simpan ke Firebase (File I/O Replacement)
        push(ref(db, 'mahasiswa'), { nama, nim, jurusan });
        studentForm.reset();
        alert("Data berhasil disimpan!");
    } catch (error) {
        // Exception Handling
        alert("Kesalahan Input: " + error.message);
    }
});

// --- Menampilkan Data (Tampil & Modularisasi) ---
function renderTable(dataArray) {
    const tableBody = document.getElementById('studentTableBody');
    tableBody.innerHTML = '';
    
    dataArray.forEach((mhs) => {
        const row = `<tr>
            <td>${mhs.getNim()}</td>
            <td>${mhs.nama}</td>
            <td>${mhs.jurusan}</td>
            <td>... Tombol Edit/Hapus ...</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Listener Real-time
onValue(ref(db, 'mahasiswa'), (snapshot) => {
    const rawData = snapshot.val();
    manager.data = []; // Reset array
    
    if (rawData) {
        Object.keys(rawData).forEach(id => {
            const m = rawData[id];
            // Instansiasi Object dari Class Mahasiswa
            manager.data.push(new Mahasiswa(m.nama, m.nim, m.jurusan));
        });
        
        manager.bubbleSort(); // Terapkan Bubble Sort otomatis
        renderTable(manager.data);
    }
});
