document.getElementById('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nama = document.getElementById('name').value;
    const nim = document.getElementById('nim').value;
    const jurusan = document.getElementById('major').value;
    const submitBtn = document.getElementById('submitBtn');

    try {
        // 1. Validasi dengan Regex (Aturan Akademik)
        validateInput(nama, nim); 

        // 2. Cek apakah sedang mode Edit atau Tambah Baru
        if (editId === null) {
            // Tambah Data Baru
            push(dbRef, { 
                nama: nama, 
                nim: nim, 
                jurusan: jurusan 
            })
            .then(() => {
                alert("Data Berhasil Ditambahkan!");
                document.getElementById('studentForm').reset();
            })
            .catch((error) => {
                // Menangkap error jika Rules Firebase menolak
                console.error("Firebase Error:", error);
                alert("Gagal menyimpan ke Database: " + error.message);
            });
        } else {
            // Update Data Lama
            update(ref(db, `mahasiswa/${editId}`), { 
                nama: nama, 
                nim: nim, 
                jurusan: jurusan 
            })
            .then(() => {
                editId = null;
                submitBtn.innerText = "Simpan";
                document.getElementById('studentForm').reset();
                alert("Data Berhasil Diperbarui!");
            });
        }
    } catch (error) {
        // Menangkap error dari fungsi validateInput (Regex)
        alert("Kesalahan: " + error.message);
    }
});
