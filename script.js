let currentNavDate = new Date(); let editId = null; const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; let currentHistoryTab = 'Tugas Kuliah';

const liburNasional = {
    "2026-01-01": "Tahun Baru Masehi", "2026-02-18": "Isra Mikraj", "2026-02-19": "Tahun Baru Imlek", "2026-03-20": "Hari Raya Nyepi / Idul Fitri",
    "2026-03-21": "Idul Fitri", "2026-04-03": "Wafat Isa Al Masih", "2026-05-01": "Hari Buruh Nasional", "2026-05-14": "Kenaikan Isa Al Masih",
    "2026-05-27": "Idul Adha", "2026-05-31": "Hari Raya Waisak", "2026-06-01": "Hari Lahir Pancasila", "2026-08-17": "Hari Kemerdekaan RI",
    "2026-08-25": "Maulid Nabi Muhammad SAW", "2026-12-25": "Hari Raya Natal"
};

const strk = "var(--text-muted)";
const fll = "var(--bg-main)";
const iClk = `<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${fll}" stroke="${strk}" stroke-width="2"></circle><polyline points="12 6 12 12 16 14" fill="none" stroke="${strk}" stroke-width="2"></polyline></svg>`;
const iDat = `<svg class="svg-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="${fll}" stroke="${strk}" stroke-width="2"></rect><line x1="16" y1="2" x2="16" y2="6" stroke="${strk}" stroke-width="2"></line><line x1="8" y1="2" x2="8" y2="6" stroke="${strk}" stroke-width="2"></line><line x1="3" y1="10" x2="21" y2="10" stroke="${strk}" stroke-width="2"></line></svg>`;
const iCir = `<svg class="svg-icon" style="width:22px;height:22px;margin:0;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${fll}" stroke="${strk}" stroke-width="2"></circle></svg>`;
const iChkCir = `<svg class="svg-icon" style="width:22px;height:22px;margin:0;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${fll}" stroke="${strk}" stroke-width="2"></circle><path d="M8 12.5L10.5 15L16 9" fill="none" stroke="${strk}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

const iEdt = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="${strk}" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const iUsr = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="${strk}" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
const iRom = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="${strk}" stroke-width="2"><path d="M3 21h18"></path><path d="M7 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"></path><path d="M15 12h.01"></path></svg>`;
const iPls = `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const iDel = `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="${strk}" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

function toggleFabMenu() { const menu = document.getElementById('fab-menu'); if(menu) menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; editId = null; }
function toggleDetail(element) { const detail = element.querySelector('.card-detail'); if(detail) detail.classList.toggle('show'); }
function formatShortDate(dateStr) {
    if(!dateStr) return ''; const parts = dateStr.split('-');
    if(parts.length !== 3) return dateStr; return `${parts[2]}-${parts[1]}-${parts[0].substring(2)}`;
}

function isUserHoliday(dateStr) {
    let savedLibur = JSON.parse(localStorage.getItem('nalaLibur')) || [];
    let tDate = new Date(dateStr); tDate.setHours(0,0,0,0);
    for(let l of savedLibur) {
        let sDate = new Date(l.startDate); sDate.setHours(0,0,0,0);
        let eDate = new Date(l.endDate); eDate.setHours(0,0,0,0);
        if(tDate >= sDate && tDate <= eDate) return l.name;
    }
    return null;
}

function updateSwatchSelection(colorVal) {
    if(!document.getElementById('new-task-color')) return;
    document.getElementById('new-task-color').value = colorVal;
    document.querySelectorAll('.swatch').forEach(s => { s.classList.toggle('selected', s.dataset.color.toUpperCase() === colorVal.toUpperCase()); });
}

function toggleTaskDone(id) {
    let tasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let idx = tasks.findIndex(t => t.id == id);
    if(idx !== -1) { tasks[idx].status = tasks[idx].status === 'done' ? 'pending' : 'done'; localStorage.setItem('nalaTasks', JSON.stringify(tasks)); refreshAllViews(); }
}
function toggleDismiss(type, id, dateStr) {
    if(type === 'tugas' || type === 'acara') { toggleTaskDone(id); return; }
    let dismissed = JSON.parse(localStorage.getItem('nalaDismissed')) || []; const key = `${type}_${id}_${dateStr}`;
    if(dismissed.includes(key)) dismissed = dismissed.filter(k => k !== key); else dismissed.push(key);
    localStorage.setItem('nalaDismissed', JSON.stringify(dismissed)); refreshAllViews();
}
function isDismissed(type, id, dateStr) { return (JSON.parse(localStorage.getItem('nalaDismissed')) || []).includes(`${type}_${id}_${dateStr}`); }

function deleteTask(id) {
    if(!confirm('Hapus jadwal ini?')) return;
    let tasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; tasks = tasks.filter(t => t.id != id);
    localStorage.setItem('nalaTasks', JSON.stringify(tasks)); refreshAllViews();
}
function deleteRoutine(id) {
    if(!confirm('Hapus rutinitas ini?')) return;
    let routines = JSON.parse(localStorage.getItem('nalaRoutines')) || []; routines = routines.filter(r => r.id != id);
    localStorage.setItem('nalaRoutines', JSON.stringify(routines)); refreshAllViews();
}
function deleteLibur(id) {
    if(!confirm('Hapus jadwal libur ini?')) return;
    let libur = JSON.parse(localStorage.getItem('nalaLibur')) || []; libur = libur.filter(l => l.id != id);
    localStorage.setItem('nalaLibur', JSON.stringify(libur)); refreshAllViews();
}

function refreshAllViews() {
    if(document.getElementById('schedule-list')) loadTodaySchedule();
    if(document.getElementById('calendar-grid')) { renderMonthCalendar(); renderUpcomingTasks(); renderHistory(currentHistoryTab); }
    if(document.getElementById('matkul-list')) renderMatkulList();
}

// --- BERANDA ---
if(document.getElementById('schedule-list')) loadTodaySchedule();

async function loadTodaySchedule() {
    const list = document.getElementById('schedule-list'); const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayDayName = namaHari[today.getDay()]; let combinedSchedule = [];
    
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let savedRoutines = JSON.parse(localStorage.getItem('nalaRoutines')) || [];

    let isHoliday = liburNasional[todayStr] || isUserHoliday(todayStr);
    let todaysMatkul = savedMatkul.filter(m => m.hari === todayDayName);
    if(todayDayName === 'Minggu' || isHoliday) todaysMatkul = []; 
    
    todaysMatkul = todaysMatkul.filter(m => !overrides.some(o => o.matkulId === m.id && o.originalDate === todayStr));
    let movedIn = overrides.filter(o => o.newDate === todayStr).map(o => { let orig = savedMatkul.find(m => m.id === o.matkulId); return orig ? { ...orig, ...o, isOverride: true } : null; }).filter(x => x);
    [...todaysMatkul, ...movedIn].forEach(m => {
        let eTime = m.isOverride && m.newEndTime !== undefined ? m.newEndTime : (m.jamSelesai || '');
        combinedSchedule.push({ type: 'kuliah', id: m.id, name: `${m.name}`, badge: 'Kuliah', time: m.isOverride ? m.newTime : m.jamMulai, endTime: eTime, color: 'var(--color-kuliah)', ruang: m.isOverride ? m.newRuangan : m.ruangan, dosen: m.isOverride ? m.newDosen : m.dosen });
    });

    savedTasks.filter(t => t.date === todayStr).forEach(t => {
        let tCat = t.category.toLowerCase().includes('tugas') ? 'Tugas' : 'Acara';
        combinedSchedule.push({ type: tCat.toLowerCase(), id: t.id, name: t.name, badge: tCat, time: t.time, endTime: '', color: t.color || 'var(--color-acara)', desc: t.deskripsi || 'Tidak ada catatan.', via: t.pengumpulan, cat: t.category, status: t.status });
    });
    savedRoutines.filter(r => r.days.includes(todayDayName)).forEach(r => {
        combinedSchedule.push({ type: 'rutin', id: r.id, name: r.name, badge: 'Rutinitas', time: r.time, endTime: '', color: r.color || 'var(--color-rutin)', desc: r.desc || 'Jadwal Rutinitas Mingguan' });
    });

    const salatNames = ['Subuh', 'Zuhur', 'Asar', 'Maghrib', 'Isya'];
    try {
        const t = (await (await fetch('https://api.aladhan.com/v1/timingsByCity?city=Yogyakarta&country=Indonesia&method=11')).json()).data.timings;
        ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach((w, i) => { combinedSchedule.push({ type: 'salat', id: salatNames[i], name: salatNames[i], badge: '', time: t[w], endTime: '', color: 'var(--color-salat)', desc: 'Waktu Salat' }); });
    } catch (e) {
        ['04:30', '11:45', '15:00', '17:45', '19:00'].forEach((w, i) => { combinedSchedule.push({ type: 'salat', id: salatNames[i], name: `${salatNames[i]}`, badge: '', time: w, endTime: '', color: 'var(--color-salat)', desc: 'Waktu Salat (Offline)' }); });
    }

    combinedSchedule.sort((a, b) => a.time.localeCompare(b.time));
    list.innerHTML = combinedSchedule.length ? '' : '<p style="text-align:center; color:var(--text-muted);">Semua jadwal hari ini sudah beres! 🔥</p>';
    
    combinedSchedule.forEach(item => {
        let completed = (item.type === 'tugas' || item.type === 'acara') ? (item.status === 'done') : isDismissed(item.type, item.id, todayStr);
        let titleStyle = completed ? 'text-decoration: line-through; color: var(--state-dimmed);' : '';
        let btnIcon = completed ? iChkCir : iCir; let cardOpacity = completed ? 'opacity: 0.65;' : '';

        let detailHtml = '';
        if(item.type === 'kuliah') { 
            detailHtml = `<div class="detail-grid"><div class="detail-item">${iRom} <div><span>Ruangan</span>${item.ruang}</div></div><div class="detail-item">${iUsr} <div><span>Dosen</span>${item.dosen}</div></div></div>`; 
        } else if(item.type === 'tugas' || item.type === 'acara') { 
            detailHtml = `<p style="line-height:1.5;">${item.desc}</p> ${item.via ? `<div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--border-line);"><span>Via/Kumpul:</span> <strong>${item.via}</strong></div>` : ''} 
            <div class="card-actions three-btns">
                <button class="icon-btn delete" onclick="event.stopPropagation(); deleteTask(${item.id})">${iDel} Hapus</button>
                <div><button class="icon-btn" onclick="event.stopPropagation(); openEditTask(${item.id}, '${item.cat}')">${iEdt} Edit</button></div>
            </div>`; 
        } else if(item.type === 'rutin') {
            detailHtml = `<p>${item.desc}</p>
            <div class="card-actions three-btns">
                <button class="icon-btn delete" onclick="event.stopPropagation(); deleteRoutine(${item.id})">${iDel} Hapus</button>
                <div><button class="icon-btn" onclick="event.stopPropagation(); openEditRoutine(${item.id})">${iEdt} Edit</button></div>
            </div>`;
        } else { detailHtml = `<p>${item.desc}</p>`; }

        let badgeHtml = item.badge ? `<span class="tag-pill" style="${titleStyle}">${item.badge}</span>` : '';

        list.innerHTML += `
            <div class="card" onclick="toggleDetail(this)" style="${cardOpacity}">
                <div class="card-header" style="background-color: ${item.color};">
                    <div class="card-header-top">
                        <div class="card-title-group">
                            <button class="check-btn" onclick="event.stopPropagation(); toggleDismiss('${item.type}', '${item.id}', '${todayStr}')">${btnIcon}</button>
                            <div>
                                <h3 style="${titleStyle}">${item.name}</h3>
                                <small class="time-badge" style="${titleStyle}">${iClk} ${item.time} ${item.endTime ? '- '+item.endTime : ''}</small>
                            </div>
                        </div>
                        ${badgeHtml}
                    </div>
                </div>
                <div class="card-detail">${detailHtml}</div>
            </div>`;
    });
}

// --- KALENDER (TUGAS MENDATANG & RIWAYAT) ---
if(document.getElementById('calendar-grid')) {
    renderMonthCalendar(); renderHistory('Tugas Kuliah'); renderUpcomingTasks();
    let tabsContainer = document.querySelector('.history-tabs');
    if(tabsContainer && !document.getElementById('tab-semua')) { tabsContainer.innerHTML += `<button class="tab-btn" id="tab-semua" onclick="renderHistory('Semua')">Semua Data</button>`; }
    if(document.getElementById('native-month-picker')) {
        document.getElementById('native-month-picker').addEventListener('change', function(e) {
            if(e.target.value) { const p = e.target.value.split('-'); currentNavDate.setFullYear(parseInt(p[0]), parseInt(p[1]) - 1); renderMonthCalendar(); }
        });
    }
}

function renderUpcomingTasks() {
    const list = document.getElementById('upcoming-list'); if(!list) return; list.innerHTML = '';
    let pendingTasks = (JSON.parse(localStorage.getItem('nalaTasks')) || []).filter(t => t.status !== 'done' && (t.category === 'Tugas Kuliah' || t.category === 'Tugas'));
    if(pendingTasks.length === 0) { list.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">Semua tugas sudah beres.</p>'; return; }

    const today = new Date(); today.setHours(0,0,0,0);
    pendingTasks.sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(t => {
        let taskDate = new Date(t.date); taskDate.setHours(0,0,0,0);
        let diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
        let badgeClass = 'countdown-badge'; let badgeText = diffDays < 0 ? 'Terlewat!' : diffDays === 0 ? 'Hari Ini!' : diffDays === 1 ? 'Besok!' : `H-${diffDays}`;
        if(diffDays <= 1) badgeClass += ' countdown-alert';

        list.innerHTML += `
            <div class="card" onclick="toggleDetail(this)">
                <div class="card-header" style="background-color: ${t.color || 'var(--color-tugas)'};">
                    <div class="card-header-top">
                        <div class="card-title-group">
                            <button class="check-btn" onclick="event.stopPropagation(); toggleTaskDone('${t.id}')">${iCir}</button>
                            <div>
                                <h3>${t.name}</h3>
                                <small>${iDat} ${formatShortDate(t.date)} &nbsp; ${iClk} ${t.time}</small>
                            </div>
                        </div>
                        <span class="${badgeClass}">${badgeText}</span>
                    </div>
                </div>
                <div class="card-detail">
                    <p style="margin-bottom:12px; line-height:1.5;">${t.deskripsi || 'Tidak ada deskripsi.'}</p>
                    ${t.pengumpulan ? `<div style="margin-bottom:12px; padding-bottom:12px; border-bottom:1px dashed var(--border-line); font-size:13px;"><strong>Via:</strong> ${t.pengumpulan}</div>` : ''}
                    <div class="card-actions three-btns">
                        <button class="icon-btn delete" onclick="event.stopPropagation(); deleteTask(${t.id})">${iDel} Hapus</button>
                        <div><button class="icon-btn" onclick="event.stopPropagation(); openEditTask(${t.id}, '${t.category}')">${iEdt} Edit</button></div>
                    </div>
                </div>
            </div>`;
    });
}

function renderHistory(tabName) {
    currentHistoryTab = tabName; 
    if(document.getElementById('tab-tk')) document.getElementById('tab-tk').classList.toggle('active', tabName === 'Tugas Kuliah'); 
    if(document.getElementById('tab-tb')) document.getElementById('tab-tb').classList.toggle('active', tabName === 'Tugas');
    if(document.getElementById('tab-semua')) document.getElementById('tab-semua').classList.toggle('active', tabName === 'Semua');
    
    let list = document.getElementById('history-list'); if(!list) return; list.innerHTML = '';
    
    if (tabName === 'Semua') {
        let tasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
        let routines = JSON.parse(localStorage.getItem('nalaRoutines')) || [];
        let libur = JSON.parse(localStorage.getItem('nalaLibur')) || [];
        let allDataHtml = '';
        
        tasks.filter(t => t.category === 'Acara').sort((a,b) => b.date.localeCompare(a.date)).forEach(t => {
            allDataHtml += `
                <div class="card history-card" onclick="toggleDetail(this)">
                    <div class="card-header" style="background-color: ${t.color || 'var(--color-acara)'}; opacity:0.9;">
                        <div class="card-header-top">
                            <div class="card-title-group">
                                <div>
                                    <h3 style="color:#FFFFFF;">${t.name}</h3>
                                    <small style="color:var(--state-dimmed);">${iDat} ${formatShortDate(t.date)} &nbsp; ${iClk} ${t.time}</small>
                                </div>
                            </div>
                            <span class="tag-pill">Acara</span>
                        </div>
                    </div>
                    <div class="card-detail">
                        <p>${t.deskripsi || 'Tidak ada deskripsi'}</p>
                        <div class="card-actions three-btns">
                            <button class="icon-btn delete" onclick="event.stopPropagation(); deleteTask(${t.id})">${iDel} Hapus</button>
                            <div><button class="icon-btn" onclick="event.stopPropagation(); openEditTask(${t.id}, '${t.category}')">${iEdt} Edit</button></div>
                        </div>
                    </div>
                </div>`;
        });
        
        routines.forEach(r => {
            allDataHtml += `
                <div class="card history-card" onclick="toggleDetail(this)">
                    <div class="card-header" style="background-color: ${r.color || 'var(--color-rutin)'}; opacity:0.9;">
                        <div class="card-header-top">
                            <div class="card-title-group">
                                <div>
                                    <h3 style="color:#FFFFFF;">${r.name}</h3>
                                    <small style="color:var(--state-dimmed);">${iClk} ${r.time} | Setiap: ${r.days.join(', ')}</small>
                                </div>
                            </div>
                            <span class="tag-pill">Rutinitas</span>
                        </div>
                    </div>
                    <div class="card-detail">
                        <p>${r.desc || 'Rutinitas Mingguan'}</p>
                        <div class="card-actions three-btns">
                            <button class="icon-btn delete" onclick="event.stopPropagation(); deleteRoutine(${r.id})">${iDel} Hapus</button>
                            <div><button class="icon-btn" onclick="event.stopPropagation(); openEditRoutine(${r.id})">${iEdt} Edit</button></div>
                        </div>
                    </div>
                </div>`;
        });
        
        libur.forEach(l => {
            let dateText = l.startDate === l.endDate ? formatShortDate(l.startDate) : `${formatShortDate(l.startDate)} s/d ${formatShortDate(l.endDate)}`;
            allDataHtml += `
                <div class="card history-card" onclick="toggleDetail(this)">
                    <div class="card-header" style="background-color: var(--color-minggu); opacity:0.9;">
                        <div class="card-header-top">
                            <div class="card-title-group">
                                <div>
                                    <h3 style="color:#FFFFFF;">${l.name}</h3>
                                    <small style="color:var(--state-dimmed);">${iDat} ${dateText}</small>
                                </div>
                            </div>
                            <span class="tag-pill">Libur</span>
                        </div>
                    </div>
                    <div class="card-detail">
                        <p>Libur Kampus / Pribadi</p>
                        <div class="card-actions three-btns">
                            <button class="icon-btn delete" onclick="event.stopPropagation(); deleteLibur(${l.id})">${iDel} Hapus</button>
                            <div><button class="icon-btn" onclick="event.stopPropagation(); openEditLibur(${l.id})">${iEdt} Edit</button></div>
                        </div>
                    </div>
                </div>`;
        });
        
        if(!allDataHtml) list.innerHTML = '<p style="color:var(--text-muted); font-size:14px; text-align:center;">Database Acara & Rutinitas kosong.</p>';
        else list.innerHTML = allDataHtml;
        return;
    }

    let doneTasks = (JSON.parse(localStorage.getItem('nalaTasks')) || []).filter(t => t.status === 'done' && t.category === tabName); 
    if(doneTasks.length === 0) { list.innerHTML = '<p style="color:var(--text-muted); font-size:14px; text-align:center;">Belum ada riwayat selesai.</p>'; return; }
    
    doneTasks.sort((a,b) => b.date.localeCompare(a.date)).forEach(t => { 
        list.innerHTML += `
            <div class="card history-card" onclick="toggleDetail(this)">
                <div class="card-header" style="background-color: ${t.color || 'var(--color-tugas)'}; opacity:0.8;">
                    <div class="card-header-top">
                        <div class="card-title-group">
                            <button class="check-btn" onclick="event.stopPropagation(); toggleTaskDone('${t.id}')">${iChkCir}</button>
                            <div>
                                <h3 class="dimmed-text">${t.name}</h3>
                                <small class="dimmed-text">${iDat} ${formatShortDate(t.date)}</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-detail">
                    <p style="color:var(--text-muted); line-height:1.5;">${t.deskripsi || t.category} ${t.pengumpulan ? `<br>Via: ${t.pengumpulan}` : ''}</p>
                    <div class="card-actions three-btns">
                        <button class="icon-btn delete" onclick="event.stopPropagation(); deleteTask(${t.id})">${iDel} Hapus</button>
                        <div><button class="icon-btn" onclick="event.stopPropagation(); openEditTask(${t.id}, '${t.category}')">${iEdt} Edit</button></div>
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
    const prevDays = new Date(year, month, 0).getDate();
    
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    
    for(let i = firstDay - 1; i >= 0; i--) { grid.innerHTML += `<div class="day-cell dimmed" onclick="changeMonth(-1)"><span class="day-number">${prevDays - i}</span></div>`; }
    for(let i = 1; i <= daysInMonth; i++) {
        let currentLoopDate = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`; let loopDayName = namaHari[new Date(year, month, i).getDay()];
        
        let dayColors = []; 
        let isHoliday = liburNasional[currentLoopDate] || isUserHoliday(currentLoopDate);
        let isOffDay = (loopDayName === 'Minggu') || isHoliday;
        
        let matkulsToday = savedMatkul.filter(m => m.hari === loopDayName); 
        if(isOffDay) matkulsToday = []; 
        
        matkulsToday = matkulsToday.filter(m => !overrides.some(o => o.matkulId === m.id && o.originalDate === currentLoopDate));
        let movedIn = overrides.filter(o => o.newDate === currentLoopDate);
        if(matkulsToday.length > 0 || movedIn.length > 0) dayColors.push('var(--color-kuliah)');
        
        savedTasks.filter(t => t.date === currentLoopDate && t.status !== 'done').forEach(t => dayColors.push(t.color || 'var(--color-tugas)'));
        
        let uColors = [...new Set(dayColors)]; let pillStyle = '';
        if (uColors.length === 1) pillStyle = `background: ${uColors[0]};`;
        else if (uColors.length > 1) {
            let gradient = 'linear-gradient(to right, '; let step = 100 / uColors.length;
            uColors.forEach((c, idx) => { gradient += `${c} ${idx * step}%, ${c} ${(idx + 1) * step}%${idx < uColors.length - 1 ? ', ' : ''}`; });
            pillStyle = `background: ${gradient});`;
        }
        let pillHtml = uColors.length > 0 ? `<div class="event-pill-container"><div class="event-pill" style="${pillStyle}"></div></div>` : '';
        let numClass = isOffDay ? 'day-number sunday-red' : 'day-number';
        grid.innerHTML += `<div class="day-cell" onclick="showDayDetails('${currentLoopDate}', '${loopDayName}')"><span class="${numClass}">${i}</span>${pillHtml}</div>`;
    }
    const totalCells = firstDay + daysInMonth; const nextDays = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
    for(let i = 1; i <= nextDays; i++) { grid.innerHTML += `<div class="day-cell dimmed" onclick="changeMonth(1)"><span class="day-number">${i}</span></div>`; }
}

function showDayDetails(dateStr, dayName) {
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; 
    let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let savedRoutines = JSON.parse(localStorage.getItem('nalaRoutines')) || [];
    
    let isHoliday = liburNasional[dateStr] || isUserHoliday(dateStr); 
    let isOffDay = (dayName === 'Minggu') || isHoliday;
    
    let popUpItems = [];

    // 1. Ambil Jadwal Kuliah Reguler & Override
    let matkulsToday = savedMatkul.filter(m => m.hari === dayName); 
    if(isOffDay) matkulsToday = []; 
    matkulsToday = matkulsToday.filter(m => !overrides.some(o => o.matkulId === m.id && o.originalDate === dateStr));
    let movedIn = overrides.filter(o => o.newDate === dateStr).map(o => { let orig = savedMatkul.find(m => m.id === o.matkulId); return orig ? { ...orig, ...o, isOverride: true } : null; }).filter(x => x);
    
    [...matkulsToday, ...movedIn].forEach(m => {
        let time = m.isOverride ? m.newTime : m.jamMulai; 
        let end = m.isOverride && m.newEndTime !== undefined ? m.newEndTime : (m.jamSelesai || ''); 
        let ruang = m.isOverride ? m.newRuangan : m.ruangan; 
        let dosen = m.isOverride ? m.newDosen : m.dosen; 
        let origDate = m.isOverride ? m.originalDate : dateStr;
        popUpItems.push({ type: 'kuliah', id: m.id, name: m.name, badge: 'Kuliah', time: time, endTime: end, color: 'var(--color-kuliah)', ruang: ruang, dosen: dosen, origDate: origDate });
    });

    // 2. Ambil Tugas & Acara
    savedTasks.filter(t => t.date === dateStr).forEach(t => {
        let tCat = t.category.toLowerCase().includes('tugas') ? 'Tugas' : 'Acara';
        popUpItems.push({ type: 'tugasAcara', id: t.id, name: t.name, badge: tCat, time: t.time, endTime: '', color: t.color || 'var(--color-tugas)', desc: t.deskripsi, via: t.pengumpulan });
    });

    // 3. Ambil Rutinitas
    savedRoutines.filter(r => r.days.includes(dayName)).forEach(r => {
        popUpItems.push({ type: 'rutin', id: r.id, name: r.name, badge: 'Rutinitas', time: r.time, endTime: '', color: r.color || 'var(--color-rutin)', desc: r.desc || 'Jadwal Rutinitas Mingguan' });
    });

    // Urutkan berdasarkan jam
    popUpItems.sort((a, b) => a.time.localeCompare(b.time));

    // Render ke HTML
    let listHtml = '';
    popUpItems.forEach(item => {
        let detailHtml = '';
        if (item.type === 'kuliah') {
            detailHtml = `
                <div class="detail-grid"><div class="detail-item">${iRom} <div><span>Ruangan</span>${item.ruang}</div></div><div class="detail-item">${iUsr} <div><span>Dosen</span>${item.dosen}</div></div></div>
                <div class="card-actions"><button class="icon-btn" onclick="event.stopPropagation(); openRescheduleModal(${item.id}, '${item.origDate}', '${dateStr}')">${iEdt} Pindah Jadwal</button></div>`;
        } else if (item.type === 'tugasAcara') {
            detailHtml = `<p style="line-height:1.5;">${item.desc || 'Tidak ada deskripsi'}</p>${item.via ? `<div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--border-line);"><span>Via/Kumpul:</span> <strong>${item.via}</strong></div>` : ''}`;
        } else {
            detailHtml = `<p style="line-height:1.5;">${item.desc}</p>`;
        }

        listHtml += `
            <div class="card" onclick="toggleDetail(this)" style="margin-bottom:10px;">
                <div class="card-header" style="background-color: ${item.color}; padding:12px 16px;">
                    <div class="card-header-top">
                        <div class="card-title-group">
                            <div>
                                <h3 style="font-size:14px;">${item.name}</h3>
                                <small class="time-badge">${item.time} ${item.endTime ? '- '+item.endTime : ''}</small>
                            </div>
                        </div>
                        <span class="tag-pill">${item.badge}</span>
                    </div>
                </div>
                <div class="card-detail" style="padding:12px 16px;">${detailHtml}</div>
            </div>`;
    });
    
    if(!listHtml) listHtml = '<p style="color:var(--text-muted); font-size:14px; text-align:center;">Tidak ada jadwal.</p>';
    
    let holidayText = isHoliday ? ` ${isHoliday}` : '';
    document.getElementById('detail-date-title').innerText = `${formatShortDate(dateStr)}${holidayText}`; 
    document.getElementById('detail-list').innerHTML = listHtml; document.getElementById('day-detail-modal').style.display = 'flex';
}

function openRescheduleModal(matkulId, origDate, activeDate) {
    closeModal('day-detail-modal'); let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
    let original = savedMatkul.find(m => m.id === matkulId); let existing = overrides.find(o => o.matkulId === matkulId && o.originalDate === origDate);
    document.getElementById('res-matkulId').value = matkulId; document.getElementById('res-originalDate').value = origDate; 
    document.getElementById('res-date').value = existing ? existing.newDate : activeDate; document.getElementById('res-time').value = existing ? existing.newTime : original.jamMulai;
    if(document.getElementById('res-time-end')) document.getElementById('res-time-end').value = existing && existing.newEndTime !== undefined ? existing.newEndTime : original.jamSelesai;
    document.getElementById('res-ruang').value = existing ? existing.newRuangan : original.ruangan; document.getElementById('res-dosen').value = existing ? existing.newDosen : original.dosen;
    document.getElementById('reschedule-modal').style.display = 'flex';
}

function saveReschedule() {
    const mId = parseInt(document.getElementById('res-matkulId').value); const origDate = document.getElementById('res-originalDate').value;
    const timeEndInput = document.getElementById('res-time-end'); const newEndTime = timeEndInput ? timeEndInput.value : '';
    let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || []; overrides = overrides.filter(o => !(o.matkulId === mId && o.originalDate === origDate));
    overrides.push({ matkulId: mId, originalDate: origDate, newDate: document.getElementById('res-date').value, newTime: document.getElementById('res-time').value, newEndTime: newEndTime, newRuangan: document.getElementById('res-ruang').value, newDosen: document.getElementById('res-dosen').value });
    localStorage.setItem('nalaOverrides', JSON.stringify(overrides)); closeModal('reschedule-modal'); renderMonthCalendar();
}

function openModal(category) {
    editId = null; document.getElementById('modal-title').innerText = `Tambah ${category}`; document.getElementById('insert-form').reset();
    
    document.getElementById('field-nama-kegiatan').style.display = (category === 'Kuliah') ? 'none' : 'block';
    if(document.getElementById('field-matkul-dropdown')) document.getElementById('field-matkul-dropdown').style.display = (category === 'Tugas Kuliah' || category === 'Kuliah') ? 'block' : 'none';
    if(document.getElementById('field-pengumpulan')) document.getElementById('field-pengumpulan').style.display = (category === 'Tugas Kuliah') ? 'block' : 'none';
    if(document.getElementById('field-ruangan')) document.getElementById('field-ruangan').style.display = (category === 'Kuliah') ? 'block' : 'none';
    
    if(document.getElementById('field-rutinitas-hari')) document.getElementById('field-rutinitas-hari').style.display = (category === 'Rutinitas') ? 'block' : 'none';
    if(document.getElementById('field-warna')) { document.getElementById('field-warna').style.display = (category === 'Acara' || category === 'Rutinitas') ? 'block' : 'none'; }
    if(document.getElementById('field-tanggal')) document.getElementById('field-tanggal').style.display = (category === 'Rutinitas') ? 'none' : 'block';
    if(document.getElementById('field-tanggal-selesai')) { document.getElementById('field-tanggal-selesai').style.display = (category === 'Libur') ? 'block' : 'none'; }
    
    if(document.getElementById('field-jam')) document.getElementById('field-jam').style.display = (category === 'Libur') ? 'none' : 'block';
    if(document.getElementById('field-jam-selesai')) document.getElementById('field-jam-selesai').style.display = (category === 'Kuliah') ? 'block' : 'none';
    if(document.getElementById('field-desc')) document.getElementById('field-desc').style.display = (category === 'Libur' || category === 'Kuliah') ? 'none' : 'block';
    
    document.getElementById('current-category').value = category;
    if(document.getElementById('new-task-color')) updateSwatchSelection(category === 'Rutinitas' ? '#8C6239' : '#3E5A47');
    
    if(category === 'Tugas Kuliah' || category === 'Kuliah') {
        const sel = document.getElementById('task-matkul-select'); sel.innerHTML = '<option value="">-- Pilih Kuliah --</option>';
        let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; 
        let uniqueMatkul = [];
        savedMatkul.forEach(m => {
            if(!uniqueMatkul.includes(m.name)) { uniqueMatkul.push(m.name); sel.innerHTML += `<option value="${m.name}">${m.name}</option>`; }
        });
    }
    document.getElementById('insert-modal').style.display = 'flex'; toggleFabMenu(); 
}

function openEditTask(id, category) {
    openModal(category); editId = id; document.getElementById('modal-title').innerText = `Edit ${category}`;
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || []; let task = savedTasks.find(t => t.id == id);
    if(task) {
        document.getElementById('new-task-name').value = task.name; document.getElementById('new-task-date').value = task.date;
        document.getElementById('new-task-time').value = task.time; document.getElementById('new-task-desc').value = task.deskripsi || '';
        if(category === 'Acara' && document.getElementById('new-task-color')) updateSwatchSelection(task.color);
        if(category === 'Tugas Kuliah') { document.getElementById('task-matkul-select').value = task.matkulId; document.getElementById('task-via').value = task.pengumpulan; }
    }
}

function openEditRoutine(id) {
    openModal('Rutinitas'); editId = id; document.getElementById('modal-title').innerText = `Edit Rutinitas`;
    let savedRoutines = JSON.parse(localStorage.getItem('nalaRoutines')) || []; let routine = savedRoutines.find(r => r.id == id);
    if(routine) {
        document.getElementById('new-task-name').value = routine.name; document.getElementById('new-task-time').value = routine.time;
        if(document.getElementById('new-task-desc')) document.getElementById('new-task-desc').value = routine.desc || '';
        if(document.getElementById('new-task-color')) updateSwatchSelection(routine.color);
        document.querySelectorAll('input[name="routine-days"]').forEach(cb => { cb.checked = routine.days.includes(cb.value); });
    }
}

function openEditLibur(id) {
    openModal('Libur'); editId = id; document.getElementById('modal-title').innerText = `Edit Libur`;
    let savedLibur = JSON.parse(localStorage.getItem('nalaLibur')) || []; let libur = savedLibur.find(l => l.id == id);
    if(libur) {
        document.getElementById('new-task-name').value = libur.name; 
        document.getElementById('new-task-date').value = libur.startDate;
        if(document.getElementById('new-task-date-end')) document.getElementById('new-task-date-end').value = libur.endDate;
    }
}

function saveNewTask() {
    const category = document.getElementById('current-category').value; const name = document.getElementById('new-task-name').value;
    
    if(category === 'Libur') {
        const date = document.getElementById('new-task-date').value; const endDateInput = document.getElementById('new-task-date-end'); const endDate = (endDateInput && endDateInput.value) ? endDateInput.value : date;
        if(!name || !date) return alert("Nama dan Tanggal Mulai wajib diisi!");
        let liburData = { id: editId ? editId : Date.now(), name: name, startDate: date, endDate: endDate };
        let savedLibur = JSON.parse(localStorage.getItem('nalaLibur')) || [];
        if(editId) { const idx = savedLibur.findIndex(l => l.id == editId); if(idx !== -1) savedLibur[idx] = liburData; } else { savedLibur.push(liburData); }
        localStorage.setItem('nalaLibur', JSON.stringify(savedLibur));
    } 
    else if(category === 'Rutinitas') {
        const time = document.getElementById('new-task-time').value;
        const descInput = document.getElementById('new-task-desc'); const desc = descInput ? descInput.value : '';
        let selectedDays = []; document.querySelectorAll('input[name="routine-days"]:checked').forEach(cb => selectedDays.push(cb.value));
        if(!name || !time || selectedDays.length === 0) return alert("Nama, jam, dan hari wajib diisi!");
        let routineData = { id: editId ? editId : Date.now(), name: name, time: time, days: selectedDays, color: document.getElementById('new-task-color').value, desc: desc };
        let savedRoutines = JSON.parse(localStorage.getItem('nalaRoutines')) || [];
        if(editId) { const idx = savedRoutines.findIndex(r => r.id == editId); if(idx !== -1) savedRoutines[idx] = routineData; } else { savedRoutines.push(routineData); }
        localStorage.setItem('nalaRoutines', JSON.stringify(savedRoutines));
    }
    else if(category === 'Kuliah') {
        const matkulName = document.getElementById('task-matkul-select').value; const date = document.getElementById('new-task-date').value; const time = document.getElementById('new-task-time').value;
        const endTime = document.getElementById('new-task-time-end').value; const ruang = document.getElementById('new-task-ruang').value;
        if(!matkulName || !date || !time) return alert("Pilih Kuliah, Tanggal, dan Jam Mulai!");
        
        let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; 
        let orig = savedMatkul.find(m => m.name === matkulName);
        if(!orig) return alert("Data kuliah tidak ditemukan!");

        let overrides = JSON.parse(localStorage.getItem('nalaOverrides')) || [];
        overrides.push({ matkulId: orig.id, originalDate: 'EXTRA_'+Date.now(), newDate: date, newTime: time, newEndTime: endTime, newRuangan: ruang || orig.ruangan, newDosen: orig.dosen });
        localStorage.setItem('nalaOverrides', JSON.stringify(overrides));
    }
    else {
        const time = document.getElementById('new-task-time').value; const date = document.getElementById('new-task-date').value; 
        if(!name || !date || !time) return alert("Semua wajib diisi!"); 
        let taskData = { id: editId ? editId : Date.now(), name: name, date: date, time: time, category: category, status: 'pending', deskripsi: document.getElementById('new-task-desc').value };
        if(category === 'Tugas Kuliah') { taskData.color = 'var(--color-tugas)'; taskData.matkulId = document.getElementById('task-matkul-select').value; taskData.pengumpulan = document.getElementById('task-via').value; } 
        else if (category === 'Acara') { taskData.color = document.getElementById('new-task-color') ? document.getElementById('new-task-color').value : 'var(--color-acara)'; } 
        else { taskData.color = 'var(--color-tugas)'; }
        
        let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
        if(editId) { const idx = savedTasks.findIndex(t => t.id == editId); if(idx !== -1) savedTasks[idx] = taskData; } else { savedTasks.push(taskData); }
        localStorage.setItem('nalaTasks', JSON.stringify(savedTasks));
    }
    closeModal('insert-modal'); refreshAllViews();
}

if(document.getElementById('matkul-list')) renderMatkulList();
function openMatkulModal() { editId = null; document.getElementById('matkul-form').reset(); document.getElementById('matkul-modal').style.display = 'flex'; }

function saveMatkul() {
    const name = document.getElementById('m-name').value; const hari = document.getElementById('m-hari').value; const jamM = document.getElementById('m-jamMulai').value;
    if(!name || !hari || !jamM) return alert("Semua wajib diisi!");
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    let matkulData = { id: editId ? editId : Date.now(), name: name, hari: hari, jamMulai: jamM, jamSelesai: document.getElementById('m-jamSelesai').value, dosen: document.getElementById('m-dosen').value, ruangan: document.getElementById('m-ruangan').value };
    if(editId) { const idx = savedMatkul.findIndex(m => m.id == editId); if(idx !== -1) savedMatkul[idx] = matkulData; } else { savedMatkul.push(matkulData); }
    localStorage.setItem('nalaMatkul', JSON.stringify(savedMatkul)); closeModal('matkul-modal'); renderMatkulList();
}

function renderMatkulList() {
    const list = document.getElementById('matkul-list'); if(!list) return; list.innerHTML = ''; let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || [];
    if(savedMatkul.length === 0) { list.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Belum ada jadwal kuliah.</p>'; return; }
    savedMatkul.forEach(m => { 
        list.innerHTML += `
            <div class="card" onclick="toggleDetail(this)">
                <div class="card-header" style="background-color: var(--color-kuliah);">
                    <div class="card-header-top">
                        <div class="card-title-group">
                            <div>
                                <h3 style="font-size:15px;">${m.name}</h3>
                                <small class="time-badge">${m.hari}</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-detail">
                    <div class="detail-grid">
                        <div class="detail-item">${iClk} <div><span>Waktu</span>${m.jamMulai} - ${m.jamSelesai}</div></div>
                        <div class="detail-item">${iRom} <div><span>Ruangan</span>${m.ruangan}</div></div>
                        <div class="detail-item" style="grid-column: span 2;">${iUsr} <div><span>Dosen Pengampu</span>${m.dosen}</div></div>
                    </div>
                    <div class="card-actions three-btns">
                        <button class="icon-btn delete" onclick="event.stopPropagation(); deleteMatkul(${m.id})">${iDel} Hapus</button>
                        <div><button class="icon-btn" onclick="event.stopPropagation(); editMatkul(${m.id})">${iEdt} Edit</button></div>
                    </div>
                </div>
            </div>`; 
    });
}
function editMatkul(id) {
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; let m = savedMatkul.find(x => x.id == id);
    if(m) { editId = m.id; document.getElementById('m-name').value = m.name; document.getElementById('m-hari').value = m.hari; document.getElementById('m-jamMulai').value = m.jamMulai; document.getElementById('m-jamSelesai').value = m.jamSelesai; document.getElementById('m-dosen').value = m.dosen; document.getElementById('m-ruangan').value = m.ruangan; document.getElementById('matkul-modal').style.display = 'flex'; }
}
function deleteMatkul(id) {
    if(!confirm('Hapus jadwal kuliah ini?')) return;
    let savedMatkul = JSON.parse(localStorage.getItem('nalaMatkul')) || []; savedMatkul = savedMatkul.filter(m => m.id != id);
    localStorage.setItem('nalaMatkul', JSON.stringify(savedMatkul)); renderMatkulList();
}

document.addEventListener("DOMContentLoaded", () => { 
    document.querySelectorAll('.fab').forEach(f => f.innerHTML = iPls);
    document.querySelectorAll('.swatch').forEach(sw => { sw.addEventListener('click', function(e) { e.stopPropagation(); updateSwatchSelection(this.dataset.color); }); });
});
