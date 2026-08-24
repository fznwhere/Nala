let currentNavDate = new Date();
let editId = null; // Menyimpan ID data yang sedang diedit

function toggleFabMenu() {
    const menu = document.getElementById('fab-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; editId = null; }

// Utility Format Hari
const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// --- LOGIKA BERANDA (Hari Ini) ---
if(document.getElementById('schedule-list')) loadTodaySchedule();

async function loadTodaySchedule() {
    const list = document.getElementById('schedule-list');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayDayName = namaHari[today.getDay()];
    
    let combinedSchedule = [];

    // 1. Tarik Data Matkul Hari Ini
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    let todaysMatkul = savedMatkul.filter(m => m.hari === todayDayName);
    todaysMatkul.forEach(m => {
        combinedSchedule.push({ id: m.id, name: `Matkul: ${m.name}`, time: m.jamMulai, color: 'var(--color-matkul)', details: `R: ${m.ruangan} | Dosen: ${m.dosen}` });
    });

    // 2. Tarik Data Acara / Tugas Hari Ini
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let todaysTasks = savedTasks.filter(t => t.date === todayStr);
    todaysTasks.forEach(t => {
        combinedSchedule.push({ id: t.id, name: t.name, time: t.time, color: t.color || 'var(--color-tugas)', details: t.category });
    });

    // 3. API Salat dengan Fallback (Pencegah Blank)
    try {
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Yogyakarta&country=Indonesia&method=11');
        const data = await res.json();
        const t = data.data.timings;
        combinedSchedule.push(
            { name: 'Subuh', time: t.Fajr, color: '#9BBAD4', details: 'Rutinitas' },
            { name: 'Zuhur', time: t.Dhuhr, color: '#9BBAD4', details: 'Rutinitas' },
            { name: 'Asar', time: t.Asr, color: '#9BBAD4', details: 'Rutinitas' },
            { name: 'Maghrib', time: t.Maghrib, color: '#9BBAD4', details: 'Rutinitas' },
            { name: 'Isya', time: t.Isha, color: '#9BBAD4', details: 'Rutinitas' }
        );
    } catch (e) {
        // Jika offline, gunakan waktu rata-rata Jogja
        combinedSchedule.push(
            { name: 'Subuh (Offline)', time: '04:30', color: '#9BBAD4', details: 'Rutinitas' },
            { name: 'Zuhur (Offline)', time: '11:45', color: '#9BBAD4', details: 'Rutinitas' },
            { name: 'Asar (Offline)', time: '15:00', color: '#9BBAD4', details: 'Rutinitas' },
            { name: 'Maghrib (Offline)', time: '17:45', color: '#9BBAD4', details: 'Rutinitas' },
            { name: 'Isya (Offline)', time: '19:00', color: '#9BBAD4', details: 'Rutinitas' }
        );
    }

    combinedSchedule.sort((a, b) => a.time.localeCompare(b.time));
    list.innerHTML = combinedSchedule.length ? '' : '<p style="text-align:center; color:var(--text-muted);">Kosong.</p>';

    combinedSchedule.forEach(item => {
        list.innerHTML += `
            <div class="card" style="border-left: 4px solid ${item.color};">
                <h3>${item.name}</h3><p style="font-size: 12px; color: var(--text-muted); margin-top:4px;">⏰ ${item.time} | ${item.details}</p>
            </div>`;
    });
}

// --- LOGIKA KALENDER ---
if(document.getElementById('calendar-grid')) {
    renderMonthCalendar();
    // Setup Native Month Picker
    document.getElementById('native-month-picker').addEventListener('change', function(e) {
        if(e.target.value) {
            const parts = e.target.value.split('-');
            currentNavDate.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1);
            renderMonthCalendar();
        }
    });
}

function changeMonth(offset) {
    currentNavDate.setMonth(currentNavDate.getMonth() + offset);
    renderMonthCalendar();
}

function renderMonthCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const year = currentNavDate.getFullYear();
    const month = currentNavDate.getMonth();
    
    // Update Text dan Value Picker
    document.getElementById('month-display-text').innerText = currentNavDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    document.getElementById('native-month-picker').value = `${year}-${String(month+1).padStart(2, '0')}`;

    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach(d => { grid.innerHTML += `<div class="day-name">${d}</div>`; });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];

    for(let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

    for(let i = 1; i <= daysInMonth; i++) {
        let currentLoopDate = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        let loopDayName = namaHari[new Date(year, month, i).getDay()];
        
        let dotsHtml = '';
        
        // Cek Matkul
        if(savedMatkul.some(m => m.hari === loopDayName)) {
            dotsHtml += `<div class="dot" style="background-color: var(--color-matkul);"></div>`;
        }
        
        // Cek Acara / Tugas
        savedTasks.filter(t => t.date === currentLoopDate).forEach(t => {
            dotsHtml += `<div class="dot" style="background-color: ${t.color || 'var(--color-tugas)'};"></div>`;
        });
        
        grid.innerHTML += `
            <div class="day-cell" onclick="showDayDetails('${currentLoopDate}', '${loopDayName}')">
                <span class="day-number">${i}</span>
                <div class="event-dots">${dotsHtml}</div>
            </div>`;
    }
}

function showDayDetails(dateStr, dayName) {
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    
    let tasksThisDay = savedTasks.filter(t => t.date === dateStr);
    let matkulThisDay = savedMatkul.filter(m => m.hari === dayName);
    
    let listHtml = '';
    
    matkulThisDay.forEach(m => {
        listHtml += `<div style="padding: 10px; border-left: 3px solid var(--color-matkul); margin-bottom: 8px; background: var(--bg-main); border-radius: 5px;">
            <strong>${m.jamMulai} - ${m.name}</strong> <br>
            <small>Ruang: ${m.ruangan} | Dosen: ${m.dosen}</small>
        </div>`;
    });

    tasksThisDay.forEach(t => {
        // Tombol Edit
        listHtml += `<div style="padding: 10px; border-left: 3px solid ${t.color || 'var(--color-tugas)'}; margin-bottom: 8px; background: var(--bg-main); border-radius: 5px;">
            <button class="edit-btn" onclick="openEditTask(${t.id}, '${t.category}')">✏️</button>
            <strong>${t.time} - ${t.name}</strong> <br>
            <small>${t.deskripsi || t.category}</small>
        </div>`;
    });

    if(!listHtml) listHtml = '<p style="color:var(--text-muted); font-size:14px;">Tidak ada jadwal.</p>';
        
    document.getElementById('detail-date-title').innerText = `Jadwal: ${dateStr}`;
    document.getElementById('detail-list').innerHTML = listHtml;
    document.getElementById('day-detail-modal').style.display = 'flex';
}

// --- LOGIKA SIMPAN & EDIT (ACARA/TUGAS) ---
function openModal(category) {
    editId = null;
    document.getElementById('modal-title').innerText = `Tambah ${category}`;
    document.getElementById('insert-form').reset();
    
    // Tampilkan field sesuai kategori
    document.getElementById('field-matkul-dropdown').style.display = category === 'Tugas Kuliah' ? 'block' : 'none';
    document.getElementById('field-warna').style.display = category === 'Acara' ? 'block' : 'none';
    document.getElementById('current-category').value = category;

    // Populasikan dropdown matkul
    if(category === 'Tugas Kuliah') {
        const sel = document.getElementById('task-matkul-select');
        sel.innerHTML = '<option value="">-- Pilih Matkul --</option>';
        let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
        savedMatkul.forEach(m => sel.innerHTML += `<option value="${m.name}">${m.name}</option>`);
    }

    document.getElementById('insert-modal').style.display = 'flex';
    toggleFabMenu(); 
}

function openEditTask(id, category) {
    closeModal('day-detail-modal');
    openModal(category); // Siapkan form
    editId = id;
    document.getElementById('modal-title').innerText = `Edit ${category}`;
    
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let task = savedTasks.find(t => t.id === id);
    
    if(task) {
        document.getElementById('new-task-name').value = task.name;
        document.getElementById('new-task-date').value = task.date;
        document.getElementById('new-task-time').value = task.time;
        document.getElementById('new-task-desc').value = task.deskripsi || '';
        if(category === 'Acara') document.getElementById('new-task-color').value = task.color;
        if(category === 'Tugas Kuliah') {
            document.getElementById('task-matkul-select').value = task.matkulId;
            document.getElementById('task-via').value = task.pengumpulan;
        }
    }
}

function saveNewTask() {
    const category = document.getElementById('current-category').value;
    const name = document.getElementById('new-task-name').value;
    const date = document.getElementById('new-task-date').value;
    const time = document.getElementById('new-task-time').value;

    if(!name || !date || !time) return alert("Nama, tanggal, dan jam wajib diisi!"); 

    let taskData = {
        id: editId ? editId : Date.now(),
        name: name, date: date, time: time, category: category,
        deskripsi: document.getElementById('new-task-desc').value
    };

    if(category === 'Tugas Kuliah') {
        taskData.color = 'var(--color-tugas)';
        taskData.matkulId = document.getElementById('task-matkul-select').value;
        taskData.pengumpulan = document.getElementById('task-via').value;
    } else if (category === 'Acara') {
        taskData.color = document.getElementById('new-task-color').value;
    } else {
        taskData.color = '#8E44AD'; // Warna ungu untuk Tugas umum
    }

    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    if(editId) {
        const idx = savedTasks.findIndex(t => t.id === editId);
        if(idx !== -1) savedTasks[idx] = taskData;
    } else {
        savedTasks.push(taskData);
    }

    localStorage.setItem('nalaTasks', JSON.stringify(savedTasks));
    closeModal('insert-modal');
    if(document.getElementById('schedule-list')) loadTodaySchedule();
    if(document.getElementById('calendar-grid')) renderMonthCalendar();
}

// --- LOGIKA MATKUL PAGE ---
if(document.getElementById('matkul-list')) renderMatkulList();

function openMatkulModal() {
    editId = null;
    document.getElementById('matkul-form').reset();
    document.getElementById('matkul-modal').style.display = 'flex';
}

function saveMatkul() {
    const name = document.getElementById('m-name').value;
    const hari = document.getElementById('m-hari').value;
    const jamM = document.getElementById('m-jamMulai').value;
    
    if(!name || !hari || !jamM) return alert("Nama, hari, dan jam mulai wajib diisi!");

    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    let matkulData = {
        id: editId ? editId : Date.now(),
        name: name, hari: hari, jamMulai: jamM,
        jamSelesai: document.getElementById('m-jamSelesai').value,
        dosen: document.getElementById('m-dosen').value,
        ruangan: document.getElementById('m-ruangan').value
    };

    if(editId) {
        const idx = savedMatkul.findIndex(m => m.id === editId);
        if(idx !== -1) savedMatkul[idx] = matkulData;
    } else {
        savedMatkul.push(matkulData);
    }

    localStorage.setItem('nalaMatkul', JSON.stringify(savedMatkul));
    closeModal('matkul-modal');
    renderMatkulList();
}

function renderMatkulList() {
    const list = document.getElementById('matkul-list');
    list.innerHTML = '';
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    
    if(savedMatkul.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Belum ada jadwal matkul.</p>';
        return;
    }

    savedMatkul.forEach(m => {
        list.innerHTML += `
            <div class="card" style="border-left: 4px solid var(--color-matkul);">
                <h3>${m.name} <button class="edit-btn" onclick="editMatkul(${m.id})">✏️</button></h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-top:5px;">
                    📅 ${m.hari}, ${m.jamMulai} - ${m.jamSelesai} <br>
                    👤 Dosen: ${m.dosen} | 🚪 Ruang: ${m.ruangan}
                </p>
            </div>`;
    });
}

function editMatkul(id) {
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    let m = savedMatkul.find(x => x.id === id);
    if(m) {
        editId = m.id;
        document.getElementById('m-name').value = m.name;
        document.getElementById('m-hari').value = m.hari;
        document.getElementById('m-jamMulai').value = m.jamMulai;
        document.getElementById('m-jamSelesai').value = m.jamSelesai;
        document.getElementById('m-dosen').value = m.dosen;
        document.getElementById('m-ruangan').value = m.ruangan;
        document.getElementById('matkul-modal').style.display = 'flex';
    }
}
