// =========================================
// BANCO DE DADOS E CONFIGURAÇÃO INICIAL
// =========================================
const defaultDB = {
    config: { 
        name: "Barbearia Premium Pro", 
        color: "#667eea", 
        start: 9, 
        end: 19, 
        duration: 30,
        password: "admin"
    },
    barbers: [
        { id: "b1", name: "João Silva", specialty: "Cortes Modernos", photo: "https://i.pravatar.cc/300?img=12", phone: "(11) 99999-9999", bio: "Especialista em cortes modernos", active: true },
        { id: "b2", name: "Carlos Santos", specialty: "Barbas & Bigodes", photo: "https://i.pravatar.cc/300?img=33", phone: "(11) 98888-8888", bio: "Expert em modelagem de barbas", active: true }
    ],
    services: [
        { id: "s1", name: "Corte Simples", price: 40.00, duration: 30, description: "Corte tradicional", active: true },
        { id: "s2", name: "Corte + Barba", price: 70.00, duration: 60, description: "Corte completo", active: true }
    ],
    appointments: [],
    payments: { mercadoPago: { accessToken: "", publicKey: "", active: false } },
    stats: { totalClients: 0, totalRevenue: 0 }
};

let db = JSON.parse(localStorage.getItem('barberDB_v4')) || defaultDB;
let currentBooking = { clientName: '', clientPhone: '', clientEmail: '', barberId: '', serviceId: '', date: '', time: '', paymentMethod: '' };
let currentStep = 1;
let autoRefreshInterval = null;

// Salva e aplica o tema global
function saveDB() {
    localStorage.setItem('barberDB_v4', JSON.stringify(db));
    applyTheme();
}

function applyTheme() {
    document.documentElement.style.setProperty('--primary', db.config.color);
    const shopNameElements = ['nav-shop-name', 'footer-shop-name', 'sidebar-shop-name'];
    shopNameElements.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = db.config.name;
    });
    document.title = db.config.name;
}

// =========================================
// LÓGICA DO CLIENTE (INDEX.HTML)
// =========================================
function initClient() {
    applyTheme();
    const today = new Date().toISOString().split('T')[0];
    $('#client-date').val(today).attr('min', today);
    $('#client-date').on('change', function() { renderSlots(this.value); });
    loadBarbers();
    showStep(1);
}

function showStep(step) {
    $('.booking-step').addClass('hidden');
    $(`#step-${step}`).removeClass('hidden');
    $('.step').removeClass('active completed');
    for(let i = 1; i < step; i++) $(`.step[data-step="${i}"]`).addClass('completed');
    $(`.step[data-step="${step}"]`).addClass('active');
    currentStep = step;
}

function nextStep(step) {
    if(currentStep === 1) {
        const name = $('#client-name').val().trim();
        const phone = $('#client-phone').val().trim();
        if(!name || name.length < 3) return alert('Digite seu nome!');
        if(!phone || phone.length < 10) return alert('Digite um WhatsApp válido!');
        currentBooking.clientName = name;
        currentBooking.clientPhone = phone;
    }
    if(currentStep === 2 && !currentBooking.barberId) return alert('Selecione um barbeiro!');
    if(currentStep === 3) {
        if(!currentBooking.date || !currentBooking.time) return alert('Selecione data e horário!');
        generateBookingSummary();
    }
    showStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(step) { showStep(step); }

function loadBarbers() {
    const container = $('#barbers-list');
    container.empty();
    db.barbers.filter(b => b.active).forEach(barber => {
        container.append(`
            <div class="barber-card" onclick="selectBarber('${barber.id}', this)">
                <img src="${barber.photo}" class="barber-avatar">
                <div class="barber-name">${barber.name}</div>
                <div class="barber-specialty">${barber.specialty}</div>
            </div>
        `);
    });
}

function selectBarber(id, el) {
    currentBooking.barberId = id;
    $('.barber-card').removeClass('selected');
    $(el).addClass('selected');
    setTimeout(() => nextStep(3), 500);
}

function renderSlots(date) {
    currentBooking.date = date;
    const area = $('#slots-area').empty();
    const taken = db.appointments.filter(a => a.date === date && a.barberId === currentBooking.barberId && a.status !== 'cancelled').map(a => a.time);
    
    for(let h = db.config.start; h < db.config.end; h++) {
        for(let m = 0; m < 60; m += parseInt(db.config.duration)) {
            let time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            let isTaken = taken.includes(time);
            area.append(`
                <button class="slot-btn ${isTaken ? 'booked' : ''}" ${isTaken ? '' : `onclick="selectSlot('${time}', this)"`}>
                    <span class="slot-time">${time}</span>
                    <span class="slot-status">${isTaken ? 'Ocupado' : 'Disponível'}</span>
                </button>
            `);
        }
    }
}

function selectSlot(time, el) {
    currentBooking.time = time;
    $('.slot-btn').removeClass('selected');
    $(el).addClass('selected');
    setTimeout(() => nextStep(4), 500);
}

function generateBookingSummary() {
    const barber = db.barbers.find(b => b.id === currentBooking.barberId);
    $('#booking-summary').html(`
        <p><strong>Cliente:</strong> ${currentBooking.clientName}</p>
        <p><strong>Barbeiro:</strong> ${barber.name}</p>
        <p><strong>Data/Hora:</strong> ${currentBooking.date} às ${currentBooking.time}</p>
        <p><strong>Valor:</strong> R$ ${db.services[0].price.toFixed(2)}</p>
    `);
}

function selectPayment(method) {
    currentBooking.paymentMethod = method;
    $('.payment-option').removeClass('selected');
    $(`.payment-option:has(input[value="${method}"])`).addClass('selected');
}

function confirmBooking() {
    if(!currentBooking.paymentMethod) return alert('Selecione o pagamento!');
    const appt = { ...currentBooking, id: 'at' + Date.now(), status: 'confirmed', price: db.services[0].price, paymentStatus: 'pending' };
    db.appointments.push(appt);
    saveDB();
    alert('Agendamento realizado com sucesso!');
    location.reload();
}

// =========================================
// LÓGICA ADMIN (ADMIN.HTML)
// =========================================
function initAdmin() {
    applyTheme();
    $('#admin-date').val(new Date().toISOString().split('T')[0]);
    updateDashboardStats();
}

function checkLogin() {
    if($('#admin-pass').val() === db.config.password) {
        $('#login-modal').fadeOut();
        showSection('dashboard');
    } else alert('Senha incorreta!');
}

function showSection(section) {
    $('.admin-section').removeClass('active');
    $(`#section-${section}`).addClass('active');
    if(section === 'agendamentos') renderAdminList($('#admin-date').val());
}

function renderAdminList(date) {
    const table = $('#appt-list').empty();
    const appts = db.appointments.filter(a => a.date === date);
    if(appts.length === 0) return table.append('<tr><td colspan="9" class="text-center">Nenhum agendamento</td></tr>');
    
    appts.forEach(a => {
        const barber = db.barbers.find(b => b.id === a.barberId);
        table.append(`
            <tr>
                <td>${a.time}</td>
                <td>${a.clientName}</td>
                <td>${a.clientPhone}</td>
                <td>${barber ? barber.name : 'N/A'}</td>
                <td>R$ ${a.price.toFixed(2)}</td>
                <td>${a.paymentMethod}</td>
                <td>${a.status}</td>
                <td><button class="btn btn-danger btn-sm" onclick="cancelAppt('${a.id}')">Cancelar</button></td>
            </tr>
        `);
    });
}

function updateDashboardStats() {
    $('#stat-today').text(db.appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length);
    $('#stat-barbers').text(db.barbers.length);
}

function cancelAppt(id) {
    if(confirm('Deseja cancelar?')) {
        db.appointments = db.appointments.filter(a => a.id !== id);
        saveDB();
        renderAdminList($('#admin-date').val());
    }
}
