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
    appointments: [],
    users: [] // Novo array de usuários
};

let db = JSON.parse(localStorage.getItem('barberDB_v4')) || defaultDB;
let currentUser = JSON.parse(sessionStorage.getItem('barberCurrentUser')) || null;

function saveDB() {
    localStorage.setItem('barberDB_v4', JSON.stringify(db));
    applyTheme();
}

function applyTheme() {
    document.documentElement.style.setProperty('--primary', db.config.color);
    
    // Atualiza nome nos elementos
    const shopNameElements = ['nav-shop-name', 'footer-shop-name'];
    shopNameElements.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = db.config.name;
    });
    
    // Se não estiver no admin, muda o título
    if (!document.title.includes("Administrativo")) {
        document.title = db.config.name;
    }
}

// =========================================
// SISTEMA DE AUTENTICAÇÃO (CLIENTE)
// =========================================

function openAuthModal(mode) {
    $('#auth-modal').fadeIn(300).css('display', 'flex');
    toggleAuthForms(mode);
}

function closeAuthModal() {
    $('#auth-modal').fadeOut(300);
}

function toggleAuthForms(mode) {
    if(mode === 'login') {
        $('#form-login').show();
        $('#form-register').hide();
    } else {
        $('#form-login').hide();
        $('#form-register').show();
    }
}

function register() {
    const name = $('#reg-name').val();
    const phone = $('#reg-phone').val();
    const email = $('#reg-email').val();
    const pass = $('#reg-pass').val();

    if(!name || !phone || !email || !pass) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }

    // Verifica se email já existe
    const exists = db.users.find(u => u.email === email);
    if(exists) {
        alert('❌ Este e-mail já está cadastrado.');
        return;
    }

    const newUser = { name, phone, email, pass };
    db.users.push(newUser);
    saveDB();

    loginUser(newUser); // Loga automaticamente
    alert('✅ Conta criada com sucesso!');
    closeAuthModal();
}

function login() {
    const email = $('#login-email').val();
    const pass = $('#login-pass').val();

    const user = db.users.find(u => u.email === email && u.pass === pass);

    if(user) {
        loginUser(user);
        closeAuthModal();
    } else {
        alert('❌ E-mail ou senha incorretos.');
    }
}

function loginUser(user) {
    currentUser = user;
    sessionStorage.setItem('barberCurrentUser', JSON.stringify(user));
    updateClientUI();
    // Recarrega os slots para atualizar os botões
    const date = $('#client-date').val();
    if(date) renderSlots(date);
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('barberCurrentUser');
    updateClientUI();
    window.location.reload();
}

function updateClientUI() {
    if(currentUser) {
        // Navbar
        $('#user-area-guest').hide();
        $('#user-area-logged').show();
        $('#display-username').text(currentUser.name);
        
        // Card de Agendamento
        $('#guest-alert').hide();
        $('#logged-user-info').show();
        $('#info-client-name').text(currentUser.name);
        $('#info-client-phone').text(currentUser.phone);
    } else {
        $('#user-area-guest').show();
        $('#user-area-logged').hide();
        $('#guest-alert').show();
        $('#logged-user-info').hide();
    }
}

// =========================================
// PÁGINA DO CLIENTE (index.html)
// =========================================
function initClient() {
    applyTheme();
    updateClientUI();
    
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
            
            // LÓGICA DE BLOQUEIO:
            // Se ocupado -> sem ação
            // Se livre E logado -> book()
            // Se livre E deslogado -> openAuthModal()
            let action = '';
            if (!isTaken) {
                if (currentUser) {
                    action = `onclick="book('${date}', '${time}')"`;
                } else {
                    action = `onclick="alertLoginNeeded()"`;
                    statusText = "Entrar p/ Agendar"; // Texto muda se não logado
                }
            }

            area.append(`
                <button class="slot-btn ${statusClass}" ${action}>
                    <span class="slot-time">${time}</span>
                    <span class="slot-status">${statusText}</span>
                    ${!isTaken && !currentUser ? '<i class="fas fa-lock mt-1 text-muted" style="font-size:0.8rem"></i>' : ''}
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

function alertLoginNeeded() {
    alert("🔒 Você precisa fazer login para agendar!");
    openAuthModal('login');
}

function book(date, time) {
    // Verificação de segurança dupla
    if(!currentUser) {
        alertLoginNeeded();
        return;
    }

    const name = currentUser.name;
    const phone = currentUser.phone;

    const dateObj = new Date(date + 'T00:00:00');
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

    if(confirm(`✅ Confirmar agendamento?\n\n👤 ${name}\n📞 ${phone}\n📅 ${dateFormatted} às ${time}`)) {
        db.appointments.push({ 
            date, 
            time, 
            client: name, 
            phone: phone 
        });
        saveDB();
        renderSlots(date);
        alert(`🎉 Agendado com sucesso!`);
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
        alert('❌ Senha incorreta!');
        $('#admin-pass').val('').focus();
    }
}

function saveSettings() {
    db.config.name = $('#cfg-name').val();
    db.config.color = $('#cfg-color').val();
    db.config.start = parseInt($('#cfg-start').val());
    db.config.end = parseInt($('#cfg-end').val());
    db.config.duration = $('#cfg-duration').val();
    
    saveDB();
    alert('✅ Configurações salvas!');
}

function renderAdminList(date) {
    const list = $('#appt-list');
    list.empty();
    
    const appts = db.appointments.filter(a => a.date === date);
    appts.sort((a,b) => a.time.localeCompare(b.time));

    // Stats
    const totalSlots = calculateTotalSlots();
    const bookedSlots = appts.length;
    $('#appt-stats').html(`
        <div class="stat-item"><span class="stat-value">${totalSlots}</span><span class="stat-label">Vagas</span></div>
        <div class="stat-item"><span class="stat-value">${bookedSlots}</span><span class="stat-label">Ocupadas</span></div>
    `);

    if(appts.length === 0) {
        list.html('<li class="text-center text-muted py-5"><p>Nenhum agendamento hoje</p></li>');
        return;
    }

    appts.forEach(app => {
        list.append(`
            <li>
                <div class="appt-info">
                    <span class="appt-time">${app.time}</span>
                    <div>
                        <span class="appt-client d-block"><i class="fas fa-user"></i> ${app.client}</span>
                        <small class="text-muted"><i class="fas fa-phone"></i> ${app.phone || 'Sem telefone'}</small>
                    </div>
                </div>
                <div class="appt-actions">
                    <button class="btn btn-danger btn-sm" onclick="cancel('${app.date}', '${app.time}')"><i class="fas fa-trash-alt"></i></button>
                </div>
            </li>
        `);
    });
}

function calculateTotalSlots() {
    return Math.floor(((db.config.end - db.config.start) * 60) / db.config.duration);
}

function cancel(date, time) {
    if(confirm('Cancelar agendamento?')) {
        db.appointments = db.appointments.filter(a => !(a.date === date && a.time === time));
        saveDB();
        renderAdminList(date);
    }
}

function resetSystem() {
    if(confirm('ATENÇÃO: Apagar tudo (incluindo usuários)?')) {
        localStorage.removeItem('barberDB_v4');
        location.reload();
    }
}
