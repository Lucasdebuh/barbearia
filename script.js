// =========================================
// BANCO DE DADOS (LocalStorage)
// =========================================
const defaultDB = {
    config: { 
        name: "Barbearia Premium", 
        color: "#1a1a2e", 
        start: 9, 
        end: 19, 
        duration: 30 
    },
    appointments: []
};

let db = JSON.parse(localStorage.getItem('barberDB_v3')) || defaultDB;

function saveDB() {
    localStorage.setItem('barberDB_v3', JSON.stringify(db));
    applyTheme();
}

function applyTheme() {
    document.documentElement.style.setProperty('--primary', db.config.color);
    
    // Atualiza nome em todos os lugares
    const shopNameElements = ['nav-shop-name', 'footer-shop-name'];
    shopNameElements.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = db.config.name;
    });
    
    document.title = db.config.name;
}

// =========================================
// PÁGINA DO CLIENTE (index.html)
// =========================================
function initClient() {
    applyTheme();
    
    const today = new Date().toISOString().split('T')[0];
    $('#client-date').val(today).attr('min', today);
    
    $('#client-date').on('change', function() { 
        renderSlots(this.value); 
    });
    
    renderSlots(today);
}

function renderSlots(date) {
    if(!date) return;
    
    const area = $('#slots-area');
    area.empty();

    const cfg = db.config;
    const taken = db.appointments.filter(a => a.date === date).map(a => a.time);

    let hasSlots = false;
    
    for(let h = parseInt(cfg.start); h < parseInt(cfg.end); h++) {
        for(let m = 0; m < 60; m += parseInt(cfg.duration)) {
            let time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            
            let isTaken = taken.includes(time);
            let statusClass = isTaken ? 'booked' : '';
            let statusText = isTaken ? 'Ocupado' : 'Disponível';
            let action = isTaken ? '' : `onclick="book('${date}', '${time}')"`;

            area.append(`
                <button class="slot-btn ${statusClass}" ${action}>
                    <span class="slot-time">${time}</span>
                    <span class="slot-status">${statusText}</span>
                </button>
            `);
            
            hasSlots = true;
        }
    }
    
    if(!hasSlots) {
        area.html(`
            <div class="col-12 text-center text-muted py-5">
                <i class="fas fa-calendar-times fa-3x mb-3"></i>
                <p>Nenhum horário disponível para esta data</p>
            </div>
        `);
    }
}

function book(date, time) {
    const name = $('#client-name').val().trim();
    
    if(!name) { 
        alert('⚠️ Por favor, digite seu nome completo!'); 
        $('#client-name').focus();
        return; 
    }

    const dateObj = new Date(date + 'T00:00:00');
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });

    if(confirm(`✅ Confirmar agendamento?\n\n👤 Nome: ${name}\n📅 Data: ${dateFormatted}\n🕐 Horário: ${time}`)) {
        db.appointments.push({ date, time, client: name });
        saveDB();
        renderSlots(date);
        
        alert(`🎉 Agendamento confirmado com sucesso!\n\nNos vemos em ${dateFormatted} às ${time}!`);
        $('#client-name').val('');
    }
}

// =========================================
// PÁGINA DO ADMIN (admin.html)
// =========================================
function initAdmin() {
    applyTheme();
    
    $('#cfg-name').val(db.config.name);
    $('#cfg-color').val(db.config.color);
    $('#cfg-start').val(db.config.start);
    $('#cfg-end').val(db.config.end);
    $('#cfg-duration').val(db.config.duration);

    // Preview da cor
    $('#cfg-color').on('input', function() {
        $('#color-preview').css('background', this.value).text(this.value);
    });
    $('#color-preview').css('background', db.config.color).text(db.config.color);

    const today = new Date().toISOString().split('T')[0];
    $('#admin-date').val(today);
    $('#admin-date').on('change', function() { 
        renderAdminList(this.value); 
    });
}

function checkLogin() {
    const pass = $('#admin-pass').val();
    
    if(pass === 'admin') {
        $('#login-modal').fadeOut(300);
        renderAdminList($('#admin-date').val());
    } else {
        alert('❌ Senha incorreta! Tente novamente.');
        $('#admin-pass').val('').focus();
    }
}

function saveSettings() {
    const newName = $('#cfg-name').val().trim();
    const newColor = $('#cfg-color').val();
    const newStart = parseInt($('#cfg-start').val());
    const newEnd = parseInt($('#cfg-end').val());
    
    if(!newName) {
        alert('⚠️ O nome da barbearia não pode estar vazio!');
        return;
    }
    
    if(newStart >= newEnd) {
        alert('⚠️ O horário de abertura deve ser menor que o de fechamento!');
        return;
    }
    
    db.config.name = newName;
    db.config.color = newColor;
    db.config.start = newStart;
    db.config.end = newEnd;
    db.config.duration = $('#cfg-duration').val();
    
    saveDB();
    alert('✅ Configurações salvas com sucesso!\n\nO site foi atualizado.');
}

function renderAdminList(date) {
    const list = $('#appt-list');
    list.empty();
    
    const appts = db.appointments.filter(a => a.date === date);
    appts.sort((a,b) => a.time.localeCompare(b.time));

    // Estatísticas
    const totalSlots = calculateTotalSlots();
    const bookedSlots = appts.length;
    const availableSlots = totalSlots - bookedSlots;

    $('#appt-stats').html(`
        <div class="stat-item">
            <span class="stat-value">${totalSlots}</span>
            <span class="stat-label">Total de Horários</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${bookedSlots}</span>
            <span class="stat-label">Agendados</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${availableSlots}</span>
            <span class="stat-label">Disponíveis</span>
        </div>
    `);

    if(appts.length === 0) {
        list.html(`
            <li class="text-center text-muted py-5">
                <i class="fas fa-calendar-times fa-3x mb-3" style="color: #ddd;"></i>
                <p>Nenhum agendamento para esta data</p>
            </li>
        `);
        return;
    }

    appts.forEach(app => {
        list.append(`
            <li>
                <div class="appt-info">
                    <span class="appt-time">${app.time}</span>
                    <span class="appt-client">
                        <i class="fas fa-user"></i> ${app.client}
                    </span>
                </div>
                <div class="appt-actions">
                    <button class="btn btn-danger btn-sm" onclick="cancel('${app.date}', '${app.time}')">
                        <i class="fas fa-trash-alt"></i> Cancelar
                    </button>
                </div>
            </li>
        `);
    });
}

function calculateTotalSlots() {
    const cfg = db.config;
    const duration = parseInt(cfg.duration);
    const start = parseInt(cfg.start);
    const end = parseInt(cfg.end);
    const totalMinutes = (end - start) * 60;
    return Math.floor(totalMinutes / duration);
}

function cancel(date, time) {
    const appointment = db.appointments.find(a => a.date === date && a.time === time);
    
    if(confirm(`❌ Tem certeza que deseja cancelar?\n\n👤 Cliente: ${appointment.client}\n🕐 Horário: ${time}`)) {
        db.appointments = db.appointments.filter(a => !(a.date === date && a.time === time));
        saveDB();
        renderAdminList(date);
        alert('✅ Agendamento cancelado com sucesso!');
    }
}

function resetSystem() {
    if(confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os agendamentos e configurações!\n\nDeseja realmente continuar?')) {
        if(confirm('🚨 ÚLTIMA CONFIRMAÇÃO: Os dados não poderão ser recuperados!')) {
            localStorage.removeItem('barberDB_v3');
            alert('✅ Sistema resetado! A página será recarregada.');
            location.reload();
        }
    }
}