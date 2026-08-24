// --- LOGIKA TOMBOL & MODAL ---
function toggleFabMenu() {
    const menu = document.getElementById('fab-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

let currentCategory = '';
function openModal(category) {
    currentCategory = category;
    document.getElementById('modal-title').innerText = `Tambah ${category}`;
    document.getElementById('insert-modal').style.display = 'flex';
    toggleFabMenu(); 
}

function closeModal() {
    document.getElementById('insert-modal').style.display = 'none';
}

function saveNewTask() {
    const name = document.getElementById('new-task-name').value;
    const date = document.getElementById('new-task-date').value;
    const time = document.getElementById('new-task-time').value;

    if(!name || !date || !time) { 
        alert("Nama, tanggal, dan jam wajib diisi!"); 
        return; 
    }

    // Ambil jadwal lama, tambah yang baru, lalu simpan lagi
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    savedTasks.push({
        id: Date.now(),
        name: name,
        date: date,
        time: time,
        category: currentCategory.toLowerCase()
    });

    localStorage.setItem('nalaTasks', JSON.stringify(savedTasks));
    closeModal();
    
    // Refresh halaman agar langsung muncul
    if(document.getElementById('schedule-list')) loadTodaySchedule();
    if(document.getElementById('calendar-grid')) renderMonthCalendar();
}

// --- LOGIKA HALAMAN BERANDA (Jadwal Hari Ini) ---
if(document.getElementById('schedule-list')) {
    loadTodaySchedule();
}

async function loadTodaySchedule() {
    const list = document.getElementById('schedule-list');
    list.innerHTML = '<p style="text-align:center; color:#9BBAD4; margin-top:20px;">Memuat jadwal otomatis...</p>';
    
    // Dapatkan tanggal hari ini (Format YYYY-MM-DD)
    const today = new Date();
    // Penyesuaian zona waktu lokal agar akurat
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let combinedSchedule = [];

    // 1. Ambil Jadwal Tambahan (Matkul, dll) dari LocalStorage
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let todaysTasks = savedTasks.filter(t => t.date === todayStr);
    combinedSchedule = combinedSchedule.concat(todaysTasks);

    // 2. Ambil Jadwal Salat dari API
    try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Yogyakarta&country=Indonesia&method=11');
        const data = await response.json();
        const timings = data.data.timings;
        
        combinedSchedule.push(
            { id: 's1', name: 'Salat Subuh & Mandi', time: timings.Fajr, category: 'rutinitas' },
            { id: 's2', name: 'Salat Zuhur', time: timings.Dhuhr, category: 'rutinitas' },
            { id: 's3', name: 'Salat Asar', time: timings.Asr, category: 'rutinitas' },
            { id: 's4', name: 'Salat Maghrib', time: timings.Maghrib, category: 'rutinitas' },
            { id: 's5', name: 'Salat Isya & Istirahat', time: timings.Isha, category: 'rutinitas' }
        );
    } catch (error) {
        console.error("Gagal mengambil jadwal salat dari internet.", error);
    }

    // Urutkan semua kegiatan dari pagi sampai malam berdasarkan JAM
    combinedSchedule.sort((a, b) => a.time.localeCompare(b.time));

    // Render ke HTML
    list.innerHTML = '';
    if(combinedSchedule.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#9BBAD4; margin-top:20px;">Belum ada jadwal tersimpan hari ini.</p>';
        return;
    }

    combinedSchedule.forEach(task => {
        let borderColor = '#9BBAD4'; // Warna biru pudar untuk rutinitas (salat)
        let displayCategory = 'Rutinitas Dasar';
        
        // Beri warna sesuai kategori
        if(task.category === 'matkul') { borderColor = 'var(--color-matkul)'; displayCategory = 'Jadwal Kuliah'; }
        if(task.category === 'tugas') { borderColor = 'var(--color-tugas)'; displayCategory = 'Tugas'; }
        if(task.category === 'acara') { borderColor = 'var(--color-acara)'; displayCategory = 'Acara'; }

        list.innerHTML += `
            <div class="card" style="border-left: 4px solid ${borderColor};">
                <div class="task-info">
                    <h3>${task.name}</h3>
                    <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                        ⏰ ${task.time} | 🏷️ ${displayCategory}
                    </p>
                </div>
            </div>
        `;
    });
}

// --- LOGIKA HALAMAN KALENDER (Bulan Ini) ---
if(document.getElementById('calendar-grid')) {
    renderMonthCalendar();
}

function renderMonthCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    document.getElementById('month-display').innerText = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // Tambah Header Nama Hari
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    days.forEach(d => {
        grid.innerHTML += `<div class="day-name">${d}</div>`;
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];

    // Kotak kosong untuk hari di awal bulan
    for(let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div></div>`;
    }

    // Kotak Tanggal
    for(let i = 1; i <= daysInMonth; i++) {
        let currentLoopDate = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        let tasksThisDay = savedTasks.filter(t => t.date === currentLoopDate);
        
        let dotsHtml = '';
        tasksThisDay.forEach(t => {
            dotsHtml += `<div class="dot ${t.category}"></div>`;
        });

        // Highlight kalau itu hari ini
        let isToday = (today.getDate() === i) ? 'background-color: var(--btn-skip);' : '';

        grid.innerHTML += `
            <div class="day-cell" style="${isToday}">
                <span class="day-number">${i}</span>
                <div class="event-dots" style="margin-top:auto; display:flex; gap:3px;">${dotsHtml}</div>
            </div>
        `;
    }
}
