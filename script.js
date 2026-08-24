// Toggle FAB Menu
function toggleFabMenu() {
    const menu = document.getElementById('fab-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

// Buka Modal Berdasarkan Kategori
let currentCategory = '';
function openModal(category) {
    currentCategory = category;
    document.getElementById('modal-title').innerText = `Tambah ${category}`;
    document.getElementById('insert-modal').style.display = 'flex';
    toggleFabMenu(); // Tutup menu setelah klik
}

function closeModal() {
    document.getElementById('insert-modal').style.display = 'none';
}

// Menyimpan Jadwal Baru ke LocalStorage
function saveNewTask() {
    const name = document.getElementById('new-task-name').value;
    const date = document.getElementById('new-task-date').value;
    const time = document.getElementById('new-task-time').value;

    if(!name || !date) { alert("Nama dan tanggal wajib diisi!"); return; }

    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    savedTasks.push({
        id: Date.now(),
        name: name,
        date: date,
        time: time,
        category: currentCategory.toLowerCase() // matkul, tugas, acara
    });

    localStorage.setItem('nalaTasks', JSON.stringify(savedTasks));
    closeModal();
    
    // Refresh tampilan sesuai halaman yang sedang dibuka
    if(document.getElementById('schedule-list')) loadTodayTasks();
    if(document.getElementById('calendar-grid')) renderMonthCalendar();
}

// Fitur Home (index.html)
if(document.getElementById('schedule-list')) {
    loadTodayTasks();
}

function loadTodayTasks() {
    const list = document.getElementById('schedule-list');
    list.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];
    
    // Filter kegiatan yang tanggalnya hari ini
    let todaysTasks = savedTasks.filter(t => t.date === today);

    if(todaysTasks.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#9BBAD4;">Belum ada jadwal tersimpan hari ini.</p>';
        return;
    }

    todaysTasks.forEach(task => {
        list.innerHTML += `
            <div class="card" style="border-left: 4px solid var(--color-${task.category});">
                <h3>${task.name}</h3>
                <p>Jam: ${task.time} | Kategori: ${task.category}</p>
            </div>
        `;
    });
}

// Fitur Kalender Sebulan Penuh (kalender.html)
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

    // Tambah Header Hari
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    days.forEach(d => {
        grid.innerHTML += `<div class="day-name">${d}</div>`;
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let savedTasks = JSON.parse(localStorage.getItem('nalaTasks')) || [];

    // Kotak kosong untuk hari sebelum tanggal 1
    for(let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div></div>`;
    }

    // Kotak Tanggal
    for(let i = 1; i <= daysInMonth; i++) {
        // Format tanggal YYYY-MM-DD
        let currentLoopDate = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        // Cek apakah ada jadwal di tanggal ini
        let tasksThisDay = savedTasks.filter(t => t.date === currentLoopDate);
        
        let dotsHtml = '';
        tasksThisDay.forEach(t => {
            dotsHtml += `<div class="dot ${t.category}"></div>`;
        });

        grid.innerHTML += `
            <div class="day-cell">
                <span class="day-number">${i}</span>
                <div class="event-dots">${dotsHtml}</div>
            </div>
        `;
    }
}
