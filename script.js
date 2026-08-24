let currentNavDate = new Date(); // Untuk melacak bulan di kalender

function toggleFabMenu() {
    const menu = document.getElementById('fab-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

let currentCategory = '';
function openModal(category) {
    currentCategory = category;
    document.getElementById('modal-title').innerText = `Tambah ${category}`;
    
    // Tampilkan pemilih warna hanya jika kategorinya "Acara"
    document.getElementById('color-picker-container').style.display = category === 'Acara' ? 'block' : 'none';
    
    document.getElementById('insert-modal').style.display = 'flex';
    toggleFabMenu(); 
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function saveNewTask() {
    const name = document.getElementById('new-task-name').value;
    const date = document.getElementById('new-task-date').value;
    const time = document.getElementById('new-task-time').value;

    if(!name || !date || !time) return alert("Semua kolom wajib diisi!"); 

    // Tentukan warna berdasarkan kategori (atau input kustom jika Acara)
    let taskColor = currentCategory === 'Tugas' ? 'var(--color-tugas)' : document.getElementById('new-task-color').value;

    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    savedTasks.push({
        id: Date.now(), name: name, date: date, time: time,
        category: currentCategory.toLowerCase(),
        color: taskColor // Simpan kode warnanya
    });

    localStorage.setItem('nalaTasks', JSON.stringify(savedTasks));
    closeModal('insert-modal');
    
    if(document.getElementById('schedule-list')) loadTodaySchedule();
    if(document.getElementById('calendar-grid')) renderMonthCalendar();
}

// --- LOGIKA BERANDA ---
if(document.getElementById('schedule-list')) loadTodaySchedule();

async function loadTodaySchedule() {
    const list = document.getElementById('schedule-list');
    list.innerHTML = '<p style="text-align:center; color:#9BBAD4;">Memuat jadwal otomatis...</p>';
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let combinedSchedule = [];

    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    combinedSchedule = combinedSchedule.concat(savedTasks.filter(t => t.date === todayStr));

    try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Yogyakarta&country=Indonesia&method=11');
        const data = await response.json();
        const timings = data.data.timings;
        combinedSchedule.push(
            { name: 'Subuh', time: timings.Fajr, color: '#9BBAD4' },
            { name: 'Zuhur', time: timings.Dhuhr, color: '#9BBAD4' },
            { name: 'Asar', time: timings.Asr, color: '#9BBAD4' },
            { name: 'Maghrib', time: timings.Maghrib, color: '#9BBAD4' },
            { name: 'Isya', time: timings.Isha, color: '#9BBAD4' }
        );
    } catch (e) { console.log("Gagal memuat jadwal salat."); }

    combinedSchedule.sort((a, b) => a.time.localeCompare(b.time));
    list.innerHTML = combinedSchedule.length ? '' : '<p style="text-align:center; color:#9BBAD4;">Kosong.</p>';

    combinedSchedule.forEach(task => {
        list.innerHTML += `
            <div class="card" style="border-left: 4px solid ${task.color};">
                <h3>${task.name}</h3><p style="font-size: 12px; color: var(--text-muted);">⏰ ${task.time}</p>
            </div>`;
    });
}

// --- LOGIKA KALENDER ---
if(document.getElementById('calendar-grid')) renderMonthCalendar();

function changeMonth(offset) {
    currentNavDate.setMonth(currentNavDate.getMonth() + offset);
    renderMonthCalendar();
}

function renderMonthCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const year = currentNavDate.getFullYear();
    const month = currentNavDate.getMonth();
    document.getElementById('month-display').innerText = currentNavDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach(d => {
        grid.innerHTML += `<div class="day-name">${d}</div>`;
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];

    for(let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

    for(let i = 1; i <= daysInMonth; i++) {
        let currentLoopDate = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        let tasksThisDay = savedTasks.filter(t => t.date === currentLoopDate);
        
        let dotsHtml = tasksThisDay.map(t => `<div class="dot" style="background-color: ${t.color};"></div>`).join('');
        
        grid.innerHTML += `
            <div class="day-cell" onclick="showDayDetails('${currentLoopDate}')">
                <span class="day-number">${i}</span>
                <div class="event-dots">${dotsHtml}</div>
            </div>`;
    }
}

function showDayDetails(dateStr) {
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    let tasksThisDay = savedTasks.filter(t => t.date === dateStr);
    
    let listHtml = tasksThisDay.length 
        ? tasksThisDay.map(t => `<div style="padding: 10px; border-left: 3px solid ${t.color}; margin-bottom: 5px; background: var(--bg-main); border-radius: 5px;">${t.time} - ${t.name}</div>`).join('')
        : '<p style="color:var(--text-muted); font-size:14px;">Tidak ada acara.</p>';
        
    document.getElementById('detail-date-title').innerText = `Jadwal: ${dateStr}`;
    document.getElementById('detail-list').innerHTML = listHtml;
    document.getElementById('day-detail-modal').style.display = 'flex';
}
