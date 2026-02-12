// --- BANCO DE DADOS (LocalStorage) ---
const defaultDB = {
    config: { name: "Minha Barbearia", color: "#343a40", start: 9, end: 19, duration: 30 },
    appointments: []
};

// Carrega ou Cria o banco
let db = JSON.parse(localStorage.getItem('barberDB_v2')) || defaultDB;

function saveDB() {
    localStorage.setItem('barberDB_v2', JSON.stringify(db));
    applyTheme(); // Reaplica a cor caso tenha mudado
}

function applyTheme() {
    // Aplica a cor e o nome nas páginas
    document.documentElement.style.setProperty('--primary', db.config.color);
    const titleEl = document.getElementById('nav-shop-name');
    if(titleEl) titleEl.innerText = db.config.name;
    document.title = db.config.name;
}

// --- LÓGICA DO CLIENTE (index.html) ---
function initClient() {
    applyTheme();
    // Seta data de hoje
    const today = new Date().toISOString().split('T')[0];
    $('#client-date').val(today);
    
    // Listener
    $('#client-date').on('change', function() { renderSlots(this.value); });
    renderSlots(today);
}

function renderSlots(date) {
    if(!date) return;
    const area = $('#slots-area');
    area.empty();

    const cfg = db.config;
    // Filtra horários ocupados
    const taken = db.appointments.filter(a => a.date === date).map(a => a.time);

    // Loop de horários
    for(let h = parseInt(cfg.start); h < parseInt(cfg.end); h++) {
        for(let m = 0; m < 60; m += parseInt(cfg.duration)) {
            let time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            
            let isTaken = taken.includes(time);
            let statusClass = isTaken ? 'booked' : '';
            let label = isTaken ? 'Ocupado' : 'Disponível';
            let action = isTaken ? '' : `onclick="book('${date}', '${time}')"`;

            area.append(`
                <div class="col-4 col-md-3">
                    <button class="slot-btn ${statusClass}" ${action}>
                        ${time}<br>
                        <small style="font-weight:normal">${label}</small>
                    </button>
                </div>
            `);
        }
    }
}

function book(date, time) {
    const name = $('#client-name').val();
    if(!name) { alert('Digite seu nome!'); return; }

    if(confirm(`Confirmar corte para ${name} às ${time}?`)) {
        db.appointments.push({ date: date, time: time, client: name });
        saveDB();
        renderSlots(date);
        alert('Agendado com sucesso!');
        $('#client-name').val('');
    }
}

// --- LÓGICA DO ADMIN (admin.html) ---
function initAdmin() {
    // Aplica visual mas mantém bloqueado pelo modal
    applyTheme(); 
    
    // Preenche configurações atuais
    $('#cfg-name').val(db.config.name);
    $('#cfg-color').val(db.config.color);
    $('#cfg-start').val(db.config.start);
    $('#cfg-end').val(db.config.end);
    $('#cfg-duration').val(db.config.duration);

    // Data de hoje
    const today = new Date().toISOString().split('T')[0];
    $('#admin-date').val(today);
    $('#admin-date').on('change', function() { renderAdminList(this.value); });
}

function checkLogin() {
    const pass = $('#admin-pass').val();
    if(pass === 'admin') {
        $('#login-modal').fadeOut(); // Remove bloqueio
        renderAdminList($('#admin-date').val());
    } else {
        alert('Senha incorreta!');
    }
}

function saveSettings() {
    db.config.name = $('#cfg-name').val();
    db.config.color = $('#cfg-color').val();
    db.config.start = $('#cfg-start').val();
    db.config.end = $('#cfg-end').val();
    db.config.duration = $('#cfg-duration').val();
    saveDB();
    alert('Configurações salvas! O site do cliente foi atualizado.');
}

function renderAdminList(date) {
    const list = $('#appt-list');
    list.empty();
    
    const appts = db.appointments.filter(a => a.date === date);
    appts.sort((a,b) => a.time.localeCompare(b.time));

    if(appts.length === 0) {
        list.html('<li class="list-group-item text-muted text-center">Nenhum agendamento neste dia.</li>');
        return;
    }

    appts.forEach(app => {
        list.append(`
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge badge-dark">${app.time}</span>
                    <strong class="ml-2">${app.client}</strong>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="cancel('${app.date}', '${app.time}')">
                    <i class="fas fa-trash"></i> Cancelar
                </button>
            </li>
        `);
    });
}

function cancel(date, time) {
    if(confirm('Tem certeza que deseja cancelar este agendamento?')) {
        db.appointments = db.appointments.filter(a => !(a.date === date && a.time === time));
        saveDB();
        renderAdminList(date);
    }
}

function resetSystem() {
    if(confirm('PERIGO: Isso apaga todos os agendamentos. Continuar?')) {
        localStorage.removeItem('barberDB_v2');
        location.reload();
    }
}