let currentNavDate = new Date();
let editId = null;
const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
let currentHistoryTab = 'Tugas Kuliah';

// --- LIBRARY IKON SVG MINIMALIS ---
const iClk = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const iChk = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const iEdt = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const iUsr = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
const iRom = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M7 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"></path><path d="M15 12h.01"></path></svg>`;
const iDat = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;

function toggleFabMenu() {
    const menu = document.getElementById('fab-menu');
    if(menu) menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; editId = null; }
function toggleDetail(element) {
    const detail = element.querySelector('.card-detail');
    if(detail) detail.style.display = detail.style.display === 'block' ? 'none' : 'block';
}

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

    // Matkul
    let todaysMatkul = savedMatkul.filter(m => m.hari === todayDayName);
    todaysMatkul = todaysMatkul.filter(m => !overrides.some(o => o.matkulId === m.id && o.originalDate === todayStr));
    let movedIn = overrides.filter(o => o.newDate === todayStr).map(o => {
        let orig = savedMatkul.find(m => m.id === o.matkulId); return orig ? { ...orig, ...o, isOverride: true } : null;
    }).filter(x => x);
    let finalMatkuls = [...todaysMatkul, ...movedIn];
    finalMatkuls.forEach(m => {
        combinedSchedule.push({ id: m.id, name: `Matkul: ${m.name}`, time: m.isOverride ? m.newTime : m.jamMulai, color: 'var(--color-matkul)', details: `${iRom} Ruang: ${m.isOverride ? m.newRuangan : m.ruangan} <br><br> ${iUsr} Dosen: ${m.isOverride ? m.newDosen : m.dosen}` });
    });

    // Tugas, Acara, Rutinitas
    savedTasks.filter(t => t.date === todayStr && t.status !== 'done').forEach(t => {
        combinedSchedule.push({ id: t.id, name: t.name, time: t.time, color: t.color || 'var(--color-tugas)', details: t.deskripsi || t.category });
    });
    savedRoutines.filter(r => r.days.includes(todayDayName)).forEach(r => {
        combinedSchedule.push({ id: r.id, name: r.name, time: r.time, color: r.color, details: 'Jadwal Rutin' });
    });

    // API Salat
    try {
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Yogyakarta&country=Indonesia&method=11');
        const data = await res.json();
        const t = data.data.timings;
        combinedSchedule.push({ name: 'Subuh', time: t.Fajr, color: '#9BBAD4', details: 'Waktu Salat' }, { name: 'Zuhur', time: t.Dhuhr, color: '#9BBAD4', details: 'Waktu Salat' }, { name: 'Asar', time: t.Asr, color: '#9BBAD4', details: 'Waktu Salat' }, { name: 'Maghrib', time: t.Maghrib, color: '#9BBAD4', details: 'Waktu Salat' }, { name: 'Isya', time: t.Isha, color: '#9BBAD4', details: 'Waktu Salat' });
    } catch (e) {
        combinedSchedule.push({ name: 'Subuh', time: '04:30', color: '#9BBAD4', details: 'Waktu Salat (Offline)' }, { name: 'Zuhur', time: '11:45', color: '#9BBAD4', details: 'Waktu Salat (Offline)' }, { name: 'Asar', time: '15:00', color: '#9BBAD4', details: 'Waktu Salat (Offline)' }, { name: 'Maghrib', time: '17:45', color: '#9BBAD4', details: 'Waktu Salat (Offline)' }, { name: 'Isya', time: '19:00', color: '#9BBAD4', details: 'Waktu Salat (Offline)' });
    }

    combinedSchedule.sort((a, b) => a.time.localeCompare(b.time));
    list.innerHTML = combinedSchedule.length ? '' : '<p style="text-align:center; color:var(--text-muted);">Jadwal kosong.</p>';
    
    combinedSchedule.forEach(item => {
        list.innerHTML += `
            <div class="card" style="border-left: 4px solid ${item.color};" onclick="toggleDetail(this)">
                <div class="card-header">
                    <div><h3 style="font-size: 15px; margin-bottom: 2px;">${item.name}</h3></div>
                    <span style="font-size: 13px; color: var(--text-muted);">${iClk}${item.time}</span>
                </div>
                <div class="card-detail">
                    <p style="font-size:12px; color:var(--text-muted); line-height:1.6;">${item.details}</p>
                </div>
            </div>`;
    });
}

// --- LOGIKA KALENDER & TUGAS BELUM SELESAI ---
if(document.getElementById('calendar-grid')) {
    renderMonthCalendar(); renderHistory('Tugas Kuliah'); renderUpcomingTasks();
    if(document.getElementById('native-month-picker')) {
        document.getElementById('native-month-picker').addEventListener('change', function(e) {
            if(e.target.value) {
                const parts = e.target.value.split('-'); currentNavDate.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1); renderMonthCalendar();
            }
        });
    }
}

function renderUpcomingTasks() {
    const list = document.getElementById('upcoming-list'); if(!list) return; list.innerHTML = '';
    let tasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let pendingTasks = tasks.filter(t => t.status !== 'done' && (t.category === 'Tugas Kuliah' || t.category === 'Tugas'));
    
    if(pendingTasks.length === 0) { list.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">Semua tugas sudah beres.</p>'; return; }

    const today = new Date(); today.setHours(0,0,0,0);
    pendingTasks.sort((a,b) => new Date(a.date) - new Date(b.date));

    pendingTasks.forEach(t => {
        let taskDate = new Date(t.date); taskDate.setHours(0,0,0,0);
        let diffTime = taskDate - today; let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let badgeClass = 'countdown-badge'; let badgeText = '';
        if(diffDays < 0) { badgeText = 'Terlewat!'; badgeClass += ' countdown-alert'; }
        else if (diffDays === 0) { badgeText = 'Hari Ini!'; badgeClass += ' countdown-alert'; }
        else if (diffDays === 1) { badgeText = 'Besok!'; badgeClass += ' countdown-alert'; }
        else { badgeText = `H-${diffDays}`; }

        list.innerHTML += `
            <div class="card" style="border-left: 4px solid ${t.color || 'var(--color-tugas)'};" onclick="toggleDetail(this)">
                <div class="card-header">
                    <div>
                        <h3 style="font-size: 15px; margin-bottom: 2px;">${t.name}</h3>
                        <small style="color:var(--text-muted);">${iDat} ${t.date} &nbsp; ${iClk} ${t.time}</small>
                    </div>
                    <span class="${badgeClass}">${badgeText}</span>
                </div>
                <div class="card-detail">
                    <p style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">${t.deskripsi || t.category} ${t.pengumpulan ? `<br>Via: ${t.pengumpulan}` : ''}</p>
                    <div class="card-actions">
                        <button class="icon-btn edit" onclick="event.stopPropagation(); openEditTask(${t.id}, '${t.category}')">${iEdt} Edit</button>
                        <button class="icon-btn done" onclick="event.stopPropagation(); markTaskDone(${t.id})">${iChk} Selesai</button>
                    </div>
                </div>
            </div>`;
    });
}

function changeMonth(offset) { currentNavDate.setMonth(currentNavDate.getMonth() + offset); renderMonthCalendar(); }

function renderMonthCalendar() {
    const grid = document.getElementById('calendar-grid'); if(!grid) return; grid.innerHTML = '';
    const year = currentNavDate.getFullYear(); const month = currentNavDate.getMonth();
    
    if(document.getElementById('month-display-text')) document.getElementById('month-display-text').innerText = currentNavDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if(document.getElementById('native-month-picker')) document.getElementById('native-month-picker').value = `${year}-${String(month+1).padStart(2, '0')}`;
    
    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach(d => { grid.innerHTML += `<div class="day-name">${d}</div>`; });
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    for(let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;
    
    for(let i = 1; i <= daysInMonth; i++) {
        let currentLoopDate = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`; let loopDayName = namaHari[new Date(year, month, i).getDay()];
        
        let dayColors = [];
        // Cek Matkul
        let matkulsToday = savedMatkul.filter(m => m.hari === loopDayName); matkulsToday = matkulsToday.filter(m => !overrides.some(o => o.matkulId === m.id && o.originalDate === currentLoopDate));
        let movedIn = overrides.filter(o => o.newDate === currentLoopDate);
        if(matkulsToday.length > 0 || movedIn.length > 0) dayColors.push('var(--color-matkul)');
        
        // Cek Tugas/Acara
        savedTasks.filter(t => t.date === currentLoopDate && t.status !== 'done').forEach(t => dayColors.push(t.color || 'var(--color-tugas)'));
        
        // Buat Pil Warna Kombinasi (Gradient)
        let uColors = [...new Set(dayColors)]; // Ambil warna unik saja
        let pillStyle = '';
        if (uColors.length === 1) {
            pillStyle = `background: ${uColors[0]};`;
        } else if (uColors.length > 1) {
            let gradient = 'linear-gradient(to right, ';
            let step = 100 / uColors.length;
            uColors.forEach((c, idx) => { gradient += `${c} ${idx * step}%, ${c} ${(idx + 1) * step}%${idx < uColors.length - 1 ? ', ' : ''}`; });
            gradient += ')'; pillStyle = `background: ${gradient};`;
        }
        
        let pillHtml = uColors.length > 0 ? `<div class="event-pill-container"><div class="event-pill" style="${pillStyle}"></div></div>` : '';
        grid.innerHTML += `<div class="day-cell" onclick="showDayDetails('${currentLoopDate}', '${loopDayName}')"><span class="day-number">${i}</span>${pillHtml}</div>`;
    }
}

function showDayDetails(dateStr, dayName) {
    // KHUSUS MATKUL SAJA (Tugas sudah dihapus dari pop up ini)
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    let matkulsToday = savedMatkul.filter(m => m.hari === dayName); matkulsToday = matkulsToday.filter(m => !overrides.some(o => o.matkulId === m.id && o.originalDate === dateStr));
    let movedIn = overrides.filter(o => o.newDate === dateStr).map(o => { let orig = savedMatkul.find(m => m.id === o.matkulId); return orig ? { ...orig, ...o, isOverride: true } : null; }).filter(x => x);
    let finalMatkuls = [...matkulsToday, ...movedIn]; let listHtml = '';
    
    finalMatkuls.forEach(m => {
        let time = m.isOverride ? m.newTime : m.jamMulai; let ruang = m.isOverride ? m.newRuangan : m.ruangan; let dosen = m.isOverride ? m.newDosen : m.dosen; let origDate = m.isOverride ? m.originalDate : dateStr;
        listHtml += `<div style="padding: 12px; border-left: 3px solid var(--color-matkul); margin-bottom: 8px; background: var(--bg-main); border-radius: 5px;">
            <button class="edit-btn" onclick="openRescheduleModal(${m.id}, '${origDate}', '${dateStr}')">${iEdt}</button>
            <strong style="font-size:14px; display:inline-block; margin-bottom:8px;">${iClk} ${time} - ${m.name}</strong> <br>
            <small style="color:var(--text-muted); display:flex; flex-direction:column; gap:4px;"><span>${iRom} ${ruang}</span> <span>${iUsr} ${dosen}</span></small>
        </div>`;
    });
    
    if(!listHtml) listHtml = '<p style="color:var(--text-muted); font-size:14px;">Tidak ada jadwal kuliah.</p>';
    document.getElementById('detail-date-title').innerText = `Jadwal Kuliah: ${dateStr}`; document.getElementById('detail-list').innerHTML = listHtml; document.getElementById('day-detail-modal').style.display = 'flex';
}

function openRescheduleModal(matkulId, origDate, activeDate) {
    closeModal('day-detail-modal'); let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    let original = savedMatkul.find(m => m.id === matkulId); let existing = overrides.find(o => o.matkulId === matkulId && o.originalDate === origDate);
    document.getElementById('res-matkulId').value = matkulId; document.getElementById('res-originalDate').value = origDate; 
    document.getElementById('res-date').value = existing ? existing.newDate : activeDate; document.getElementById('res-time').value = existing ? existing.newTime : original.jamMulai;
    document.getElementById('res-ruang').value = existing ? existing.newRuangan : original.ruangan; document.getElementById('res-dosen').value = existing ? existing.newDosen : original.dosen;
    document.getElementById('reschedule-modal').style.display = 'flex';
}

function saveReschedule() {
    const mId = parseInt(document.getElementById('res-matkulId').value); const origDate = document.getElementById('res-originalDate').value;
    let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || []; overrides = overrides.filter(o => !(o.matkulId === mId && o.originalDate === origDate));
    overrides.push({ matkulId: mId, originalDate: origDate, newDate: document.getElementById('res-date').value, newTime: document.getElementById('res-time').value, newRuangan: document.getElementById('res-ruang').value, newDosen: document.getElementById('res-dosen').value });
    localStorage.setItem('nalaOverrides', JSON.stringify(overrides)); closeModal('reschedule-modal'); renderMonthCalendar();
}

function markTaskDone(id) {
    let tasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let idx = tasks.findIndex(t => t.id === id);
    if(idx !== -1) { 
        tasks[idx].status = 'done'; localStorage.setItem('nalaTasks', JSON.stringify(tasks)); 
        if(document.getElementById('calendar-grid')) { renderMonthCalendar(); renderHistory(currentHistoryTab); renderUpcomingTasks(); }
        if(document.getElementById('schedule-list')) loadTodaySchedule();
    }
}

function renderHistory(tabName) {
    currentHistoryTab = tabName; 
    if(document.getElementById('tab-tk')) document.getElementById('tab-tk').classList.toggle('active', tabName === 'Tugas Kuliah'); 
    if(document.getElementById('tab-tb')) document.getElementById('tab-tb').classList.toggle('active', tabName === 'Tugas');
    let tasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let doneTasks = tasks.filter(t => t.status === 'done' && t.category === tabName); 
    let list = document.getElementById('history-list'); if(!list) return; list.innerHTML = '';
    
    if(doneTasks.length === 0) { list.innerHTML = '<p style="color:var(--text-muted); font-size:14px; text-align:center;">Belum ada riwayat selesai.</p>'; return; }
    
    doneTasks.sort((a,b) => b.date.localeCompare(a.date)); 
    doneTasks.forEach(t => { 
        list.innerHTML += `
            <div class="card" style="border-left: 4px solid gray; opacity: 0.8;" onclick="toggleDetail(this)">
                <div class="card-header">
                    <div>
                        <h3 style="font-size: 15px; margin-bottom: 2px; text-decoration: line-through;">${t.name}</h3>
                        <small style="color:var(--text-muted);">${iDat} ${t.date}</small>
                    </div>
                    <span style="color:#A3D9A5; font-size:12px; font-weight:bold; display:flex; align-items:center;">Selesai ${iChk}</span>
                </div>
                <div class="card-detail">
                    <p style="font-size:12px; color:var(--text-muted);">${t.deskripsi || t.category} ${t.pengumpulan ? `<br>Via: ${t.pengumpulan}` : ''}</p>
                </div>
            </div>`; 
    });
}

// --- LOGIKA SIMPAN TUGAS/ACARA/RUTINITAS ---
function openModal(category) {
    editId = null; document.getElementById('modal-title').innerText = `Tambah ${category}`; document.getElementById('insert-form').reset();
    if(document.getElementById('field-matkul-dropdown')) document.getElementById('field-matkul-dropdown').style.display = (category === 'Tugas Kuliah') ? 'block' : 'none';
    if(document.getElementById('field-warna')) document.getElementById('field-warna').style.display = (category === 'Acara' || category === 'Rutinitas') ? 'block' : 'none';
    if(document.getElementById('field-tanggal')) document.getElementById('field-tanggal').style.display = (category === 'Rutinitas') ? 'none' : 'block';
    if(document.getElementById('field-rutinitas-hari')) document.getElementById('field-rutinitas-hari').style.display = (category === 'Rutinitas') ? 'block' : 'none';
    
    document.getElementById('current-category').value = category;
    
    if(category === 'Tugas Kuliah') {
        const sel = document.getElementById('task-matkul-select'); sel.innerHTML = '<option value="">-- Pilih Matkul --</option>';
        let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; savedMatkul.forEach(m => sel.innerHTML += `<option value="${m.name}">${m.name}</option>`);
    }
    document.getElementById('insert-modal').style.display = 'flex'; toggleFabMenu(); 
}

function openEditTask(id, category) {
    openModal(category); editId = id; document.getElementById('modal-title').innerText = `Edit ${category}`;
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let task = savedTasks.find(t => t.id === id);
    if(task) {
        document.getElementById('new-task-name').value = task.name; document.getElementById('new-task-date').value = task.date;
        document.getElementById('new-task-time').value = task.time; document.getElementById('new-task-desc').value = task.deskripsi || '';
        if(category === 'Acara' && document.getElementById('new-task-color')) document.getElementById('new-task-color').value = task.color;
        if(category === 'Tugas Kuliah') { document.getElementById('task-matkul-select').value = task.matkulId; document.getElementById('task-via').value = task.pengumpulan; }
    }
}

function saveNewTask() {
    const category = document.getElementById('current-category').value; const name = document.getElementById('new-task-name').value; const time = document.getElementById('new-task-time').value;

    if(category === 'Rutinitas') {
        let selectedDays = []; document.querySelectorAll('input[name="routine-days"]:checked').forEach(cb => selectedDays.push(cb.value));
        if(!name || !time || selectedDays.length === 0) return alert("Nama, jam, dan minimal 1 hari wajib diisi!");
        let routineData = { id: Date.now(), name: name, time: time, days: selectedDays, color: document.getElementById('new-task-color').value };
        let savedRoutines = JSON.parse(localStorage.getItem('nalaRoutines')) || []; savedRoutines.push(routineData);
        localStorage.setItem('nalaRoutines', JSON.stringify(savedRoutines));
    } else {
        const date = document.getElementById('new-task-date').value;
        if(!name || !date || !time) return alert("Nama, tanggal, dan jam wajib diisi!"); 
        let taskData = { id: editId ? editId : Date.now(), name: name, date: date, time: time, category: category, status: 'pending', deskripsi: document.getElementById('new-task-desc').value };
        if(category === 'Tugas Kuliah') { taskData.color = 'var(--color-tugas)'; taskData.matkulId = document.getElementById('task-matkul-select').value; taskData.pengumpulan = document.getElementById('task-via').value; } 
        else if (category === 'Acara') { taskData.color = document.getElementById('new-task-color') ? document.getElementById('new-task-color').value : '#A3D9A5'; } 
        else { taskData.color = '#8E44AD'; }
        
        let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
        if(editId) { const idx = savedTasks.findIndex(t => t.id === editId); if(idx !== -1) savedTasks[idx] = taskData; } else { savedTasks.push(taskData); }
        localStorage.setItem('nalaTasks', JSON.stringify(savedTasks));
    }
    closeModal('insert-modal');
    if(document.getElementById('schedule-list')) loadTodaySchedule();
    if(document.getElementById('calendar-grid')) { renderMonthCalendar(); renderUpcomingTasks(); renderHistory(currentHistoryTab); }
}

// --- LOGIKA MATKUL PAGE ---
if(document.getElementById('matkul-list')) renderMatkulList();
function openMatkulModal() { editId = null; document.getElementById('matkul-form').reset(); document.getElementById('matkul-modal').style.display = 'flex'; }

function saveMatkul() {
    const name = document.getElementById('m-name').value; const hari = document.getElementById('m-hari').value; const jamM = document.getElementById('m-jamMulai').value;
    if(!name || !hari || !jamM) return alert("Nama, hari, dan jam mulai wajib diisi!");
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    let matkulData = { id: editId ? editId : Date.now(), name: name, hari: hari, jamMulai: jamM, jamSelesai: document.getElementById('m-jamSelesai').value, dosen: document.getElementById('m-dosen').value, ruangan: document.getElementById('m-ruangan').value };
    if(editId) { const idx = savedMatkul.findIndex(m => m.id === editId); if(idx !== -1) savedMatkul[idx] = matkulData; } else { savedMatkul.push(matkulData); }
    localStorage.setItem('nalaMatkul', JSON.stringify(savedMatkul)); closeModal('matkul-modal'); renderMatkulList();
}

function renderMatkulList() {
    const list = document.getElementById('matkul-list'); if(!list) return; list.innerHTML = ''; 
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    if(savedMatkul.length === 0) { list.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Belum ada jadwal matkul.</p>'; return; }
    savedMatkul.forEach(m => { 
        list.innerHTML += `
            <div class="card" style="border-left: 4px solid var(--color-matkul);" onclick="toggleDetail(this)">
                <div class="card-header">
                    <div><h3 style="font-size: 15px; margin-bottom: 2px;">${m.name}</h3></div>
                    <span style="font-size: 13px; color: var(--text-muted);">${m.hari}</span>
                </div>
                <div class="card-detail">
                    <p style="font-size: 12px; color: var(--text-muted); display:flex; flex-direction:column; gap:8px;">
                        <span>${iClk} ${m.jamMulai} - ${m.jamSelesai}</span>
                        <span>${iUsr} Dosen: ${m.dosen}</span>
                        <span>${iRom} Ruang: ${m.ruangan}</span>
                    </p>
                    <div class="card-actions">
                        <button class="icon-btn edit" onclick="event.stopPropagation(); editMatkul(${m.id})">${iEdt} Edit</button>
                    </div>
                </div>
            </div>`; 
    });
}

function editMatkul(id) {
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let m = savedMatkul.find(x => x.id === id);
    if(m) { editId = m.id; document.getElementById('m-name').value = m.name; document.getElementById('m-hari').value = m.hari; document.getElementById('m-jamMulai').value = m.jamMulai; document.getElementById('m-jamSelesai').value = m.jamSelesai; document.getElementById('m-dosen').value = m.dosen; document.getElementById('m-ruangan').value = m.ruangan; document.getElementById('matkul-modal').style.display = 'flex'; }
}
