let currentNavDate = new Date();
let editId = null;
const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
let currentHistoryTab = 'Tugas Kuliah';

function toggleFabMenu() {
    const menu = document.getElementById('fab-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; editId = null; }

// --- LOGIKA BERANDA (Hari Ini) ---
if(document.getElementById('schedule-list')) loadTodaySchedule();

async function loadTodaySchedule() {
    const list = document.getElementById('schedule-list');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayDayName = namaHari[today.getDay()];
    
    let combinedSchedule = [];
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let savedRoutines = JSON.parse(localStorage.getItem('nalaRoutines')) || [];

    // 1. Matkul
    let todaysMatkul = savedMatkul.filter(m => m.hari === todayDayName);
    todaysMatkul = todaysMatkul.filter(m => !overrides.some(o => o.matkulId === m.id && o.originalDate === todayStr));
    let movedIn = overrides.filter(o => o.newDate === todayStr).map(o => {
        let orig = savedMatkul.find(m => m.id === o.matkulId); return orig ? { ...orig, ...o, isOverride: true } : null;
    }).filter(x => x);
    let finalMatkuls = [...todaysMatkul, ...movedIn];
    finalMatkuls.forEach(m => {
        combinedSchedule.push({ id: m.id, name: `Matkul: ${m.name}`, time: m.isOverride ? m.newTime : m.jamMulai, color: 'var(--color-matkul)', details: `R: ${m.isOverride ? m.newRuangan : m.ruangan} | Dosen: ${m.isOverride ? m.newDosen : m.dosen}` });
    });

    // 2. Tugas, Acara, dan RUTINITAS
    savedTasks.filter(t => t.date === todayStr && t.status !== 'done').forEach(t => {
        combinedSchedule.push({ id: t.id, name: t.name, time: t.time, color: t.color || 'var(--color-tugas)', details: t.category });
    });
    savedRoutines.filter(r => r.days.includes(todayDayName)).forEach(r => {
        combinedSchedule.push({ id: r.id, name: r.name, time: r.time, color: r.color, details: 'Rutinitas' });
    });

    // 3. API Salat (LENGKAP)
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
        // Fallback lengkap jika offline
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
        list.innerHTML += `<div class="card" style="border-left: 4px solid ${item.color};">
            <h3>${item.name}</h3><p style="font-size: 12px; color: var(--text-muted); margin-top:4px;">⏰ ${item.time} | ${item.details}</p>
        </div>`;
    });
}

// --- LOGIKA KALENDER & TUGAS BELUM SELESAI ---
if(document.getElementById('calendar-grid')) {
    renderMonthCalendar();
    renderHistory('Tugas Kuliah');
    renderUpcomingTasks(); // Panggil hitung mundur
    
    if(document.getElementById('native-month-picker')) {
        document.getElementById('native-month-picker').addEventListener('change', function(e) {
            if(e.target.value) {
                const parts = e.target.value.split('-');
                currentNavDate.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1);
                renderMonthCalendar();
            }
        });
    }
}

function renderUpcomingTasks() {
    const list = document.getElementById('upcoming-list');
    if(!list) return;
    list.innerHTML = '';
    
    let tasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let pendingTasks = tasks.filter(t => t.status !== 'done' && (t.category === 'Tugas Kuliah' || t.category === 'Tugas'));
    
    if(pendingTasks.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">Semua tugas sudah beres! 🔥</p>';
        return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    // Urutkan dari deadline terdekat
    pendingTasks.sort((a,b) => new Date(a.date) - new Date(b.date));

    pendingTasks.forEach(t => {
        let taskDate = new Date(t.date);
        taskDate.setHours(0,0,0,0);
        let diffTime = taskDate - today;
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let badgeClass = 'countdown-badge';
        let badgeText = '';

        if(diffDays < 0) { badgeText = 'Terlewat!'; badgeClass += ' countdown-alert'; }
        else if (diffDays === 0) { badgeText = 'Hari Ini!'; badgeClass += ' countdown-alert'; }
        else if (diffDays === 1) { badgeText = 'Besok!'; badgeClass += ' countdown-alert'; }
        else { badgeText = `H-${diffDays}`; }

        list.innerHTML += `
            <div class="upcoming-card">
                <div>
                    <strong style="font-size:14px;">${t.name}</strong><br>
                    <small style="color:var(--text-muted);">${t.date} | ⏰ ${t.time}</small>
                </div>
                <span class="${badgeClass}">${badgeText}</span>
            </div>
        `;
    });
}

function changeMonth(offset) { currentNavDate.setMonth(currentNavDate.getMonth() + offset); renderMonthCalendar(); }

function renderMonthCalendar() { /* ... (Logika Kalender Sama Persis) ... */
    const grid = document.getElementById('calendar-grid'); grid.innerHTML = '';
    const year = currentNavDate.getFullYear(); const month = currentNavDate.getMonth();
    document.getElementById('month-display-text').innerText = currentNavDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if(document.getElementById('native-month-picker')) document.getElementById('native-month-picker').value = `${year}-${String(month+1).padStart(2, '0')}`;
    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach(d => { grid.innerHTML += `<div class="day-name">${d}</div>`; });
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    for(let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;
    for(let i = 1; i <= daysInMonth; i++) {
        let currentLoopDate = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`; let loopDayName = namaHari[new Date(year, month, i).getDay()]; let dotsHtml = '';
        let matkulsToday = savedMatkul.filter(m => m.hari === loopDayName); matkulsToday = matkulsToday.filter(m => !overrides.some(o => o.matkulId === m.id && o.originalDate === currentLoopDate));
        let movedIn = overrides.filter(o => o.newDate === currentLoopDate);
        if(matkulsToday.length > 0 || movedIn.length > 0) dotsHtml += `<div class="dot" style="background-color: var(--color-matkul);"></div>`;
        savedTasks.filter(t => t.date === currentLoopDate && t.status !== 'done').forEach(t => { dotsHtml += `<div class="dot" style="background-color: ${t.color || 'var(--color-tugas)'};"></div>`; });
        grid.innerHTML += `<div class="day-cell" onclick="showDayDetails('${currentLoopDate}', '${loopDayName}')"><span class="day-number">${i}</span><div class="event-dots">${dotsHtml}</div></div>`;
    }
}

function showDayDetails(dateStr, dayName) { /* ... (Logika Pop Up Sama Persis) ... */
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    let tasksThisDay = savedTasks.filter(t => t.date === dateStr && t.status !== 'done');
    let matkulsToday = savedMatkul.filter(m => m.hari === dayName); matkulsToday = matkulsToday.filter(m => !overrides.some(o => o.matkulId === m.id && o.originalDate === dateStr));
    let movedIn = overrides.filter(o => o.newDate === dateStr).map(o => { let orig = savedMatkul.find(m => m.id === o.matkulId); return orig ? { ...orig, ...o, isOverride: true } : null; }).filter(x => x);
    let finalMatkuls = [...matkulsToday, ...movedIn]; let listHtml = '';
    finalMatkuls.forEach(m => {
        let time = m.isOverride ? m.newTime : m.jamMulai; let ruang = m.isOverride ? m.newRuangan : m.ruangan; let dosen = m.isOverride ? m.newDosen : m.dosen; let origDate = m.isOverride ? m.originalDate : dateStr;
        listHtml += `<div style="padding: 10px; border-left: 3px solid var(--color-matkul); margin-bottom: 8px; background: var(--bg-main); border-radius: 5px;"><button class="edit-btn" onclick="openRescheduleModal(${m.id}, '${origDate}', '${dateStr}')">✏️</button><strong>${time} - ${m.name}</strong> <br><small>Ruang: ${ruang} | Dosen: ${dosen}</small></div>`;
    });
    tasksThisDay.forEach(t => {
        listHtml += `<div style="padding: 10px; border-left: 3px solid ${t.color || 'var(--color-tugas)'}; margin-bottom: 8px; background: var(--bg-main); border-radius: 5px;"><button class="edit-btn" onclick="markTaskDone(${t.id}, '${dateStr}', '${dayName}')" style="color: #A3D9A5;">✔️</button><button class="edit-btn" onclick="openEditTask(${t.id}, '${t.category}')">✏️</button><strong>${t.time} - ${t.name}</strong> <br><small>${t.deskripsi || t.category}</small></div>`;
    });
    if(!listHtml) listHtml = '<p style="color:var(--text-muted); font-size:14px;">Tidak ada jadwal.</p>';
    document.getElementById('detail-date-title').innerText = `Jadwal: ${dateStr}`; document.getElementById('detail-list').innerHTML = listHtml; document.getElementById('day-detail-modal').style.display = 'flex';
}

function openRescheduleModal(matkulId, origDate, activeDate) { /* ... (Logika Sama Persis) ... */
    closeModal('day-detail-modal'); let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    let original = savedMatkul.find(m => m.id === matkulId); let existing = overrides.find(o => o.matkulId === matkulId && o.originalDate === origDate);
    document.getElementById('res-matkulId').value = matkulId; document.getElementById('res-originalDate').value = origDate; 
    document.getElementById('res-date').value = existing ? existing.newDate : activeDate; document.getElementById('res-time').value = existing ? existing.newTime : original.jamMulai;
    document.getElementById('res-ruang').value = existing ? existing.newRuangan : original.ruangan; document.getElementById('res-dosen').value = existing ? existing.newDosen : original.dosen;
    document.getElementById('reschedule-modal').style.display = 'flex';
}
function saveReschedule() { /* ... (Logika Sama Persis) ... */
    const mId = parseInt(document.getElementById('res-matkulId').value); const origDate = document.getElementById('res-originalDate').value;
    let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || []; overrides = overrides.filter(o => !(o.matkulId === mId && o.originalDate === origDate));
    overrides.push({ matkulId: mId, originalDate: origDate, newDate: document.getElementById('res-date').value, newTime: document.getElementById('res-time').value, newRuangan: document.getElementById('res-ruang').value, newDosen: document.getElementById('res-dosen').value });
    localStorage.setItem('nalaOverrides', JSON.stringify(overrides)); closeModal('reschedule-modal'); renderMonthCalendar();
}
function markTaskDone(id, dateStr, dayName) { /* ... (Logika Sama Persis) ... */
    let tasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let idx = tasks.findIndex(t => t.id === id);
    if(idx !== -1) { tasks[idx].status = 'done'; localStorage.setItem('nalaTasks', JSON.stringify(tasks)); showDayDetails(dateStr, dayName); renderMonthCalendar(); renderHistory(currentHistoryTab); renderUpcomingTasks(); }
}
function renderHistory(tabName) { /* ... (Logika Sama Persis) ... */
    currentHistoryTab = tabName; document.getElementById('tab-tk').classList.toggle('active', tabName === 'Tugas Kuliah'); document.getElementById('tab-tb').classList.toggle('active', tabName === 'Tugas');
    let tasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let doneTasks = tasks.filter(t => t.status === 'done' && t.category === tabName); let list = document.getElementById('history-list'); list.innerHTML = '';
    if(doneTasks.length === 0) { list.innerHTML = '<p style="color:var(--text-muted); font-size:14px; text-align:center;">Belum ada riwayat selesai.</p>'; return; }
    doneTasks.sort((a,b) => b.date.localeCompare(a.date)); doneTasks.forEach(t => { list.innerHTML += `<div class="history-card"><div><strong style="font-size:14px;">${t.name}</strong><br><small style="color:var(--text-muted);">${t.date}</small></div><span style="color:#A3D9A5;">Selesai ✔️</span></div>`; });
}

// --- LOGIKA SIMPAN TUGAS/ACARA/RUTINITAS ---
function openModal(category) {
    editId = null; document.getElementById('modal-title').innerText = `Tambah ${category}`; document.getElementById('insert-form').reset();
    
    // Atur Tampilan Form Berdasarkan Kategori
    document.getElementById('field-matkul-dropdown') ? document.getElementById('field-matkul-dropdown').style.display = (category === 'Tugas Kuliah') ? 'block' : 'none' : null;
    document.getElementById('field-warna').style.display = (category === 'Acara' || category === 'Rutinitas') ? 'block' : 'none';
    
    // Jika Rutinitas, Sembunyikan Tanggal, Tampilkan Checkbox Hari
    if(document.getElementById('field-tanggal')) document.getElementById('field-tanggal').style.display = (category === 'Rutinitas') ? 'none' : 'block';
    if(document.getElementById('field-rutinitas-hari')) document.getElementById('field-rutinitas-hari').style.display = (category === 'Rutinitas') ? 'block' : 'none';
    
    document.getElementById('current-category').value = category;
    
    if(category === 'Tugas Kuliah') {
        const sel = document.getElementById('task-matkul-select'); sel.innerHTML = '<option value="">-- Pilih Matkul --</option>';
        let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; savedMatkul.forEach(m => sel.innerHTML += `<option value="${m.name}">${m.name}</option>`);
    }
    document.getElementById('insert-modal').style.display = 'flex'; toggleFabMenu(); 
}

function saveNewTask() {
    const category = document.getElementById('current-category').value;
    const name = document.getElementById('new-task-name').value;
    const time = document.getElementById('new-task-time').value;

    if(category === 'Rutinitas') {
        let selectedDays = [];
        document.querySelectorAll('input[name="routine-days"]:checked').forEach(cb => selectedDays.push(cb.value));
        if(!name || !time || selectedDays.length === 0) return alert("Nama, jam, dan minimal 1 hari wajib diisi!");
        
        let routineData = { id: Date.now(), name: name, time: time, days: selectedDays, color: document.getElementById('new-task-color').value };
        let savedRoutines = JSON.parse(localStorage.getItem('nalaRoutines')) || [];
        savedRoutines.push(routineData);
        localStorage.setItem('nalaRoutines', JSON.stringify(savedRoutines));
    } else {
        const date = document.getElementById('new-task-date').value;
        if(!name || !date || !time) return alert("Nama, tanggal, dan jam wajib diisi!"); 
        
        let taskData = { id: editId ? editId : Date.now(), name: name, date: date, time: time, category: category, status: 'pending', deskripsi: document.getElementById('new-task-desc').value };
        if(category === 'Tugas Kuliah') { taskData.color = 'var(--color-tugas)'; taskData.matkulId = document.getElementById('task-matkul-select').value; taskData.pengumpulan = document.getElementById('task-via').value; } 
        else if (category === 'Acara') { taskData.color = document.getElementById('new-task-color').value; } 
        else { taskData.color = '#8E44AD'; }
        
        let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
        if(editId) { const idx = savedTasks.findIndex(t => t.id === editId); if(idx !== -1) savedTasks[idx] = taskData; } else { savedTasks.push(taskData); }
        localStorage.setItem('nalaTasks', JSON.stringify(savedTasks));
    }

    closeModal('insert-modal');
    if(document.getElementById('schedule-list')) loadTodaySchedule();
    if(document.getElementById('calendar-grid')) { renderMonthCalendar(); renderUpcomingTasks(); renderHistory(currentHistoryTab); }
}

// Logika editTask dan matkul sisanya sama persis...
// (Pastikan sisa fungsi matkul.html yang lama ada di bawah sini jika kamu membutuhkannya, seperti openMatkulModal(), saveMatkul(), renderMatkulList(), dll)
