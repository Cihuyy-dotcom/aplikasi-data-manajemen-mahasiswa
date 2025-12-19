studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nama = document.getElementById('name').value;
    const nim = document.getElementById('nim').value;
    const jurusan = document.getElementById('major').value;

    try {
        validate(nama, nim); // Menjalankan Regex
        
        if (editId === null) {
            // PROSES TAMBAH DATA
            push(dbRef, { 
                nama: nama, 
                nim: nim, 
                jurusan: jurusan,
                createdAt: new Date().toISOString() 
            })
            .then(() => {
                alert("Berhasil Tambah Data!");
                studentForm.reset();
            })
            .catch((error) => {
                console.error("Error Firebase:", error);
                alert("Gagal ke Database: " + error.message);
            });
        } else {
            // PROSES UPDATE DATA
            update(ref(db, `mahasiswa/${editId}`), { nama, nim, jurusan })
            .then(() => {
                editId = null;
                submitBtn.innerText = "Simpan";
                studentForm.reset();
                alert("Data Berhasil Diperbarui!");
            });
        }
    } catch (error) {
        // Ini menangkap error dari Regex (Try-Catch)
        alert("Peringatan: " + error.message);
    }
});
