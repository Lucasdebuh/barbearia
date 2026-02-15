// =========================================
// BANCO DE DADOS AVANÇADO (LocalStorage)
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
        {
            id: "b1",
            name: "João Silva",
            specialty: "Cortes Modernos",
            photo: "https://i.pravatar.cc/300?img=12",
            phone: "(11) 99999-9999",
            bio: "Especialista em cortes modernos e degradês",
            active: true
        },
        {
            id: "b2",
            name: "Carlos Santos",
            specialty: "Barbas & Bigodes",
            photo: "https://i.pravatar.cc/300?img=33",
            phone: "(11) 98888-8888",
            bio: "Expert em modelagem de barbas e tratamentos",
            active: true
        }
    ],
    services: [
        {
            id: "s1",
            name: "Corte Simples",
            price: 40.00,
            duration: 30,
            description: "Corte tradicional com máquina e tesoura",
            active: true
        },
        {
            id: "s2",
            name: "Corte + Barba",
            price: 70.00,
            duration: 60,
            description: "Corte completo + modelagem de barba",
            active: true
        },
        {
            id: "s3",
            name: "Degradê Profissional",
            price: 55.00,
            duration: 45,
            description: "Degradê moderno com acabamento premium",
            active: true
        }
    ],
    appointments: [],
    payments: {
        mercadoPago: {
            accessToken: "",
            publicKey: "",
            active: false
        }
    },
    stats: {
        totalClients: 0,
        totalRevenue: 0
    }
};

let db = JSON.parse(localStorage.getItem('barberDB_v4')) || defaultDB;
let autoRefreshInterval = null;
let currentBooking = {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    barberId: '',
    serviceId: '',
    date: '',
    time: '',
    paymentMethod: ''
};

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
    
    document.title = db.config.name + " - Sistema de Agendamento";
}

// =========================================
// PÁGINA DO CLIENTE - SISTEMA DE STEPS
// =========================================
let currentStep = 1;

function initClient() {
    applyTheme();
    
    const today = new Date().toISOString().split('T')[0');
    $('#client-date').val(today).attr('min', today);
    
    $('#client-date').on('change', function() { 
        renderSlots(this.value); 
    });
    
    loadBarbers();
    showStep(1);
}

function showStep(step) {
    $('.booking-step').addClass('hidden');
    $(`#step-${step}`).removeClass('hidden');
    currentStep = step;
    
    // Atualizar indicador
    $('.step').removeClass('active completed');
    for(let i = 1; i < step; i++) {
        $(`.step[data-step="${i}"]`).addClass('completed');
    }
    $(`.step[data-step="${step}"]`).addClass('active');
}

function nextStep(step) {
    // Validações
    if(currentStep === 1) {
        const name = $('#client-name').val().trim();
        const phone = $('#client-phone').val().trim();
        
        if(!name) {
            alert('⚠️ Por favor, digite seu nome completo!');
            $('#client-name').focus();
            return;
        }
        
        if(!phone) {
            alert('⚠️ Por favor, digite seu WhatsApp!');
            $('#client-phone').focus();
            return;
        }
        
        currentBooking.clientName = name;
        currentBooking.clientPhone = phone;
        currentBooking.clientEmail = $('#client-email').val().trim();
    }
    
    if(currentStep === 2 && !currentBooking.barberId) {
        alert('⚠️ Por favor, selecione um barbeiro!');
        return;
    }
    
    if(currentStep === 3) {
        if(!currentBooking.date) {
            alert('⚠️ Por favor, selecione uma data!');
            return;
        }
        if(!currentBooking.time) {
            alert('⚠️ Por favor, selecione um horário!');
            return;
        }
        generateBookingSummary();
    }
    
    showStep(step);
}

function prevStep(step) {
    showStep(step);
}

function loadBarbers() {
    const container = $('#barbers-list');
    container.empty();
    
    const activeBarbers = db.barbers.filter(b => b.active);
    
    if(activeBarbers.length === 0) {
        container.html('<p class="text-center text-muted">Nenhum barbeiro disponível no momento.</p>');
        return;
    }
    
    activeBarbers.forEach(barber => {
        const card = `
            <div class="barber-card" onclick="selectBarber('${barber.id}')">
                <img src="${barber.photo}" alt="${barber.name}" class="barber-avatar">
                <div class="barber-name">${barber.name}</div>
                <div class="barber-specialty">${barber.specialty}</div>
                <span class="barber-badge"><i class="fas fa-star"></i> Disponível</span>
            </div>
        `;
        container.append(card);
    });
}

function selectBarber(barberId) {
    currentBooking.barberId = barberId;
    
    $('.barber-card').removeClass('selected');
    $(event.currentTarget).addClass('selected');
    
    const barber = db.barbers.find(b => b.id === barberId);
    
    $('#selected-barber-display').html(`
        <div class="alert alert-success">
            <strong><i class="fas fa-check-circle"></i> Barbeiro Selecionado:</strong> ${barber.name}
        </div>
    `);
    
    setTimeout(() => nextStep(3), 800);
}

function renderSlots(date) {
    if(!date) return;
    
    currentBooking.date = date;
    
    const area = $('#slots-area');
    area.empty();

    const cfg = db.config;
    const barberId = currentBooking.barberId;
    
    // Filtra horários ocupados para o barbeiro selecionado
    const taken = db.appointments
        .filter(a => a.date === date && a.barberId === barberId && a.status !== 'cancelled')
        .map(a => a.time);

    let hasSlots = false;
    
    for(let h = parseInt(cfg.start); h < parseInt(cfg.end); h++) {
        for(let m = 0; m < 60; m += parseInt(cfg.duration)) {
            let time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            
            let isTaken = taken.includes(time);
            let statusClass = isTaken ? 'booked' : '';
            let statusText = isTaken ? 'Ocupado' : 'Disponível';
            let action = isTaken ? '' : `onclick="selectSlot('${time}')"`;

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

function selectSlot(time) {
    currentBooking.time = time;
    $('.slot-btn').removeClass('selected');
    $(event.currentTarget).addClass('selected');
    
    setTimeout(() => nextStep(4), 500);
}

function generateBookingSummary() {
    const barber = db.barbers.find(b => b.id === currentBooking.barberId);
    const service = db.services[0]; // Por enquanto usa o primeiro serviço
    
    const dateObj = new Date(currentBooking.date + 'T00:00:00');
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    
    $('#booking-summary').html(`
        <div class="summary-item">
            <span><i class="fas fa-user"></i> Cliente:</span>
            <span><strong>${currentBooking.clientName}</strong></span>
        </div>
        <div class="summary-item">
            <span><i class="fas fa-user-tie"></i> Barbeiro:</span>
            <span><strong>${barber.name}</strong></span>
        </div>
        <div class="summary-item">
            <span><i class="fas fa-scissors"></i> Serviço:</span>
            <span><strong>${service.name}</strong></span>
        </div>
        <div class="summary-item">
            <span><i class="fas fa-calendar"></i> Data:</span>
            <span><strong>${dateFormatted}</strong></span>
        </div>
        <div class="summary-item">
            <span><i class="fas fa-clock"></i> Horário:</span>
            <span><strong>${currentBooking.time}</strong></span>
        </div>
        <div class="summary-item">
            <span><i class="fas fa-dollar-sign"></i> Valor:</span>
            <span><strong>R$ ${service.price.toFixed(2)}</strong></span>
        </div>
    `);
}

function selectPayment(method) {
    currentBooking.paymentMethod = method;
    $('.payment-option').removeClass('selected');
    
    if(method === 'local') {
        $('#pay-local').prop('checked', true);
        $('.payment-option:has(#pay-local)').addClass('selected');
    } else {
        $('#pay-online').prop('checked', true);
        $('.payment-option:has(#pay-online)').addClass('selected');
    }
}

function confirmBooking() {
    if(!currentBooking.paymentMethod) {
        alert('⚠️ Por favor, selecione uma forma de pagamento!');
        return;
    }
    
    const service = db.services[0];
    
    const appointment = {
        id: 'appt_' + Date.now(),
        clientName: currentBooking.clientName,
        clientPhone: currentBooking.clientPhone,
        clientEmail: currentBooking.clientEmail,
        barberId: currentBooking.barberId,
        serviceId: service.id,
        date: currentBooking.date,
        time: currentBooking.time,
        price: service.price,
        paymentMethod: currentBooking.paymentMethod,
        paymentStatus: currentBooking.paymentMethod === 'local' ? 'pending' : 'pending_online',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    if(currentBooking.paymentMethod === 'online') {
        // Simular processamento de pagamento online
        processOnlinePayment(appointment);
    } else {
        // Finalizar agendamento
        finalizeBooking(appointment);
    }
}

function processOnlinePayment(appointment) {
    $('#paymentModal').modal('show');
    
    // Simular geração de link de pagamento
    setTimeout(() => {
        const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAGAMENTO_${appointment.id}`;
        
        $('#payment-content').html(`
            <h5>Escaneie o QR Code para pagar</h5>
            <img src="${qrCode}" alt="QR Code" class="img-fluid my-3">
            <p class="text-muted">
                <strong>Valor:</strong> R$ ${appointment.price.toFixed(2)}<br>
                <small>Após o pagamento, você receberá a confirmação por WhatsApp</small>
            </p>
            <button class="btn btn-success btn-lg btn-block" onclick="simulatePaymentSuccess('${appointment.id}')">
                <i class="fas fa-check"></i> Simular Pagamento (Teste)
            </button>
            <button class="btn btn-secondary btn-block mt-2" onclick="payAtLocation('${appointment.id}')">
                Prefiro Pagar no Local
            </button>
        `);
    }, 2000);
    
    // Guardar temporariamente
    window.tempAppointment = appointment;
}

function simulatePaymentSuccess(apptId) {
    const appointment = window.tempAppointment;
    appointment.paymentStatus = 'paid_online';
    
    $('#paymentModal').modal('hide');
    finalizeBooking(appointment);
}

function payAtLocation(apptId) {
    const appointment = window.tempAppointment;
    appointment.paymentMethod = 'local';
    appointment.paymentStatus = 'pending';
    
    $('#paymentModal').modal('hide');
    finalizeBooking(appointment);
}

function finalizeBooking(appointment) {
    db.appointments.push(appointment);
    db.stats.totalClients++;
    
    if(appointment.paymentStatus === 'paid_online') {
        db.stats.totalRevenue += appointment.price;
    }
    
    saveDB();
    
    const barber = db.barbers.find(b => b.id === appointment.barberId);
    const dateFormatted = new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR');
    
    alert(`
🎉 AGENDAMENTO CONFIRMADO COM SUCESSO!

📋 Detalhes:
👤 Cliente: ${appointment.clientName}
✂️ Barbeiro: ${barber.name}
📅 Data: ${dateFormatted}
🕐 Horário: ${appointment.time}
💰 Valor: R$ ${appointment.price.toFixed(2)}
💳 Pagamento: ${appointment.paymentMethod === 'online' ? 'Pago Online' : 'No Local'}

Você receberá uma confirmação no WhatsApp: ${appointment.clientPhone}

Nos vemos lá! 😊
    `);
    
    // Resetar formulário
    currentBooking = {
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        barberId: '',
        serviceId: '',
        date: '',
        time: '',
        paymentMethod: ''
    };
    
    $('#client-name').val('');
    $('#client-phone').val('');
    $('#client-email').val('');
    
    showStep(1);
    location.reload();
}

// =========================================
// CONTINUA NO PRÓXIMO ARQUIVO...
// =========================================// =========================================
// FUNÇÕES ADMINISTRATIVAS AVANÇADAS
// =========================================

function initAdmin() {
    applyTheme();
    
    // Preenche configurações
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

    // Pagamentos
    $('#mp-access-token').val(db.payments.mercadoPago.accessToken);
    $('#mp-public-key').val(db.payments.mercadoPago.publicKey);
    $('#mp-active').prop('checked', db.payments.mercadoPago.active);

    const today = new Date().toISOString().split('T')[0];
    $('#admin-date').val(today);
    
    // Atualiza data no display
    updateDateDisplay(today);
    
    $('#admin-date').on('change', function() { 
        renderAdminList(this.value);
        updateDateDisplay(this.value);
    });
    
    // Iniciar auto-atualização a cada 5 segundos
    startAutoRefresh();
}

function updateDateDisplay(date) {
    const dateObj = new Date(date + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('pt-BR', { 
        weekday: 'long',
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    $('#current-date-display').text(formatted);
}

function startAutoRefresh() {
    // Limpa interval anterior se existir
    if(autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // Atualiza a cada 5 segundos sem piscar
    autoRefreshInterval = setInterval(() => {
        const currentDate = $('#admin-date').val();
        if(currentDate && $('.admin-section#section-agendamentos').hasClass('active')) {
            renderAdminList(currentDate, true); // true = silent refresh
        }
        updateDashboardStats();
    }, 5000);
}

function stopAutoRefresh() {
    if(autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

function checkLogin() {
    const pass = $('#admin-pass').val();
    
    if(pass === db.config.password) {
        $('#login-modal').fadeOut(300);
        showSection('dashboard');
        updateDashboardStats();
        renderAdminList($('#admin-date').val());
    } else {
        alert('❌ Senha incorreta! Tente novamente.');
        $('#admin-pass').val('').focus();
    }
}

function logout() {
    if(confirm('Deseja realmente sair do painel administrativo?')) {
        stopAutoRefresh();
        location.href = 'index.html';
    }
}

function showSection(section) {
    $('.admin-section').removeClass('active');
    $(`#section-${section}`).addClass('active');
    
    $('.sidebar-menu li').removeClass('active');
    $(`.sidebar-menu li:contains("${getSectionTitle(section)}")`).first().addClass('active');
    
    // Ações específicas por seção
    if(section === 'dashboard') {
        updateDashboardStats();
        renderWeekChart();
    } else if(section === 'agendamentos') {
        renderAdminList($('#admin-date').val());
    } else if(section === 'barbeiros') {
        renderBarbersList();
    } else if(section === 'servicos') {
        renderServicesList();
    } else if(section === 'relatorios') {
        generateReport();
    }
}

function getSectionTitle(section) {
    const titles = {
        'dashboard': 'Dashboard',
        'agendamentos': 'Agendamentos',
        'barbeiros': 'Barbeiros',
        'servicos': 'Serviços',
        'pagamentos': 'Pagamentos',
        'configuracoes': 'Configurações',
        'relatorios': 'Relatórios'
    };
    return titles[section] || '';
}

function toggleSidebar() {
    $('#sidebar').toggleClass('hidden');
    $('.main-content').toggleClass('full-width');
}

// =========================================
// DASHBOARD E ESTATÍSTICAS
// =========================================

function updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = db.appointments.filter(a => a.date === today && a.status !== 'cancelled');
    
    // Total de agendamentos hoje
    $('#stat-today').text(todayAppts.length);
    $('#badge-today').text(todayAppts.length);
    
    // Receita do mês
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthAppts = db.appointments.filter(a => {
        const apptDate = new Date(a.date);
        return apptDate.getMonth() === currentMonth && 
               apptDate.getFullYear() === currentYear &&
               a.paymentStatus !== 'cancelled';
    });
    
    let monthRevenue = 0;
    monthAppts.forEach(a => {
        if(a.paymentStatus === 'paid_online' || a.paymentStatus === 'paid') {
            monthRevenue += a.price;
        }
    });
    
    $('#stat-revenue').text(`R$ ${monthRevenue.toFixed(2)}`);
    
    // Total de clientes
    const uniqueClients = new Set(db.appointments.map(a => a.clientPhone));
    $('#stat-clients').text(uniqueClients.size);
    
    // Barbeiros ativos
    const activeBarbers = db.barbers.filter(b => b.active);
    $('#stat-barbers').text(activeBarbers.length);
    
    // Próximos agendamentos
    renderUpcomingAppointments();
    
    // Estatísticas de pagamento
    let onlineRevenue = 0;
    let localRevenue = 0;
    
    monthAppts.forEach(a => {
        if(a.paymentStatus === 'paid_online') {
            onlineRevenue += a.price;
        } else if(a.paymentStatus === 'paid') {
            localRevenue += a.price;
        }
    });
    
    $('#stat-online').text(`R$ ${onlineRevenue.toFixed(2)}`);
    $('#stat-local').text(`R$ ${localRevenue.toFixed(2)}`);
    $('#stat-total').text(`R$ ${(onlineRevenue + localRevenue).toFixed(2)}`);
}

function renderUpcomingAppointments() {
    const list = $('#upcoming-list');
    list.empty();
    
    const now = new Date();
    const upcoming = db.appointments
        .filter(a => {
            const apptDate = new Date(a.date + 'T' + a.time);
            return apptDate >= now && a.status !== 'cancelled';
        })
        .sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        })
        .slice(0, 5);
    
    if(upcoming.length === 0) {
        list.html('<li class="list-group-item text-muted text-center">Nenhum agendamento próximo</li>');
        return;
    }
    
    upcoming.forEach(appt => {
        const barber = db.barbers.find(b => b.id === appt.barberId);
        const dateFormatted = new Date(appt.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        
        list.append(`
            <li class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${appt.time}</strong> - ${dateFormatted}<br>
                        <small class="text-muted">${appt.clientName}</small>
                    </div>
                    <span class="badge badge-primary">${barber.name}</span>
                </div>
            </li>
        `);
    });
}

function renderWeekChart() {
    const ctx = document.getElementById('weekChart');
    if(!ctx) return;
    
    // Dados da semana
    const today = new Date();
    const weekData = [];
    const weekLabels = [];
    
    for(let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = db.appointments.filter(a => a.date === dateStr && a.status !== 'cancelled').length;
        
        weekData.push(count);
        weekLabels.push(date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }));
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weekLabels,
            datasets: [{
                label: 'Agendamentos',
                data: weekData,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// =========================================
// LISTA DE AGENDAMENTOS (COM AUTO-REFRESH)
// =========================================

function renderAdminList(date, silent = false) {
    const table = $('#appt-table tbody');
    
    // Se não for silencioso, mostra loading
    if(!silent) {
        table.html(`
            <tr>
                <td colspan="9" class="text-center py-5 text-muted">
                    <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
                    <p>Carregando agendamentos...</p>
                </td>
            </tr>
        `);
    }
    
    // Pequeno delay para suavizar
    setTimeout(() => {
        const appts = db.appointments.filter(a => a.date === date);
        appts.sort((a,b) => a.time.localeCompare(b.time));

        // Estatísticas
        const totalSlots = calculateTotalSlots();
        const bookedSlots = appts.filter(a => a.status !== 'cancelled').length;
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
            table.html(`
                <tr>
                    <td colspan="9" class="text-center py-5 text-muted">
                        <i class="fas fa-calendar-times fa-3x mb-3" style="color: #ddd;"></i>
                        <p>Nenhum agendamento para esta data</p>
                    </td>
                </tr>
            `);
            return;
        }

        table.empty();
        
        appts.forEach(appt => {
            const barber = db.barbers.find(b => b.id === appt.barberId) || { name: 'N/A' };
            const service = db.services.find(s => s.id === appt.serviceId) || { name: 'Corte' };
            
            const statusBadge = {
                'confirmed': '<span class="badge badge-success">Confirmado</span>',
                'cancelled': '<span class="badge badge-danger">Cancelado</span>',
                'completed': '<span class="badge badge-primary">Concluído</span>'
            }[appt.status] || '<span class="badge badge-secondary">Pendente</span>';
            
            const paymentBadge = {
                'paid_online': '<span class="badge badge-success"><i class="fab fa-pix"></i> Pago Online</span>',
                'paid': '<span class="badge badge-success">Pago</span>',
                'pending': '<span class="badge badge-warning">Pendente</span>',
                'pending_online': '<span class="badge badge-info">Aguardando Pag.</span>'
            }[appt.paymentStatus] || '<span class="badge badge-secondary">N/A</span>';
            
            table.append(`
                <tr data-appt-id="${appt.id}">
                    <td><strong>${appt.time}</strong></td>
                    <td>${appt.clientName}</td>
                    <td><a href="https://wa.me/55${appt.clientPhone.replace(/\D/g,'')}" target="_blank">
                        <i class="fab fa-whatsapp text-success"></i> ${appt.clientPhone}
                    </a></td>
                    <td>${barber.name}</td>
                    <td>${service.name}</td>
                    <td><strong>R$ ${appt.price.toFixed(2)}</strong></td>
                    <td>${paymentBadge}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="btn-group" role="group">
                            ${appt.status !== 'cancelled' ? `
                                <button class="btn btn-sm btn-success" onclick="markAsPaid('${appt.id}')" title="Marcar como Pago">
                                    <i class="fas fa-dollar-sign"></i>
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="completeAppointment('${appt.id}')" title="Concluir">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="cancelAppointment('${appt.id}')" title="Cancelar">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : `
                                <button class="btn btn-sm btn-secondary" disabled>Cancelado</button>
                            `}
                        </div>
                    </td>
                </tr>
            `);
        });
    }, silent ? 0 : 500);
}

function calculateTotalSlots() {
    const cfg = db.config;
    const duration = parseInt(cfg.duration);
    const start = parseInt(cfg.start);
    const end = parseInt(cfg.end);
    const totalMinutes = (end - start) * 60;
    return Math.floor(totalMinutes / duration) * db.barbers.filter(b => b.active).length;
}

function refreshAppointments() {
    const date = $('#admin-date').val();
    renderAdminList(date, false);
}

function markAsPaid(apptId) {
    const appt = db.appointments.find(a => a.id === apptId);
    if(!appt) return;
    
    appt.paymentStatus = 'paid';
    db.stats.totalRevenue += appt.price;
    saveDB();
    
    renderAdminList($('#admin-date').val(), true);
    updateDashboardStats();
}

function completeAppointment(apptId) {
    const appt = db.appointments.find(a => a.id === apptId);
    if(!appt) return;
    
    if(confirm(`Marcar atendimento de ${appt.clientName} como concluído?`)) {
        appt.status = 'completed';
        saveDB();
        renderAdminList($('#admin-date').val(), true);
    }
}

function cancelAppointment(apptId) {
    const appt = db.appointments.find(a => a.id === apptId);
    if(!appt) return;
    
    if(confirm(`❌ Cancelar agendamento de ${appt.clientName} às ${appt.time}?`)) {
        appt.status = 'cancelled';
        saveDB();
        renderAdminList($('#admin-date').val(), true);
        updateDashboardStats();
    }
}

// =========================================
// CONTINUA NA PARTE 3...
// =========================================// =========================================
// GERENCIAMENTO DE BARBEIROS
// =========================================

function renderBarbersList() {
    const container = $('#barbers-admin-list');
    container.empty();
    
    if(db.barbers.length === 0) {
        container.html('<div class="col-12"><p class="text-center text-muted">Nenhum barbeiro cadastrado.</p></div>');
        return;
    }
    
    db.barbers.forEach(barber => {
        const statusBadge = barber.active ? 
            '<span class="badge badge-success">Ativo</span>' : 
            '<span class="badge badge-secondary">Inativo</span>';
        
        container.append(`
            <div class="col-md-4 mb-4">
                <div class="barber-admin-card">
                    <img src="${barber.photo}" alt="${barber.name}" class="barber-admin-avatar">
                    <h5>${barber.name}</h5>
                    <p class="text-muted mb-2">${barber.specialty}</p>
                    ${statusBadge}
                    <hr>
                    <p class="small text-muted">${barber.bio || 'Sem descrição'}</p>
                    <p class="small"><i class="fas fa-phone"></i> ${barber.phone}</p>
                    <div class="btn-group btn-block">
                        <button class="btn btn-primary btn-sm" onclick="editBarber('${barber.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteBarber('${barber.id}')">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `);
    });
}

function openBarberModal(barberId = null) {
    if(barberId) {
        const barber = db.barbers.find(b => b.id === barberId);
        if(!barber) return;
        
        $('#barber-modal-title').text('Editar Barbeiro');
        $('#barber-id').val(barber.id);
        $('#barber-name').val(barber.name);
        $('#barber-specialty').val(barber.specialty);
        $('#barber-phone').val(barber.phone);
        $('#barber-photo').val(barber.photo);
        $('#barber-bio').val(barber.bio);
        $('#barber-active').prop('checked', barber.active);
    } else {
        $('#barber-modal-title').text('Novo Barbeiro');
        $('#barber-id').val('');
        $('#barber-name').val('');
        $('#barber-specialty').val('');
        $('#barber-phone').val('');
        $('#barber-photo').val('https://i.pravatar.cc/300');
        $('#barber-bio').val('');
        $('#barber-active').prop('checked', true);
    }
    
    $('#barberModal').modal('show');
}

function editBarber(barberId) {
    openBarberModal(barberId);
}

function saveBarber() {
    const name = $('#barber-name').val().trim();
    const specialty = $('#barber-specialty').val().trim();
    
    if(!name) {
        alert('⚠️ O nome do barbeiro é obrigatório!');
        return;
    }
    
    const barberId = $('#barber-id').val();
    const barberData = {
        id: barberId || 'b' + Date.now(),
        name: name,
        specialty: specialty || 'Barbeiro',
        phone: $('#barber-phone').val().trim(),
        photo: $('#barber-photo').val().trim() || 'https://i.pravatar.cc/300',
        bio: $('#barber-bio').val().trim(),
        active: $('#barber-active').is(':checked')
    };
    
    if(barberId) {
        // Editar existente
        const index = db.barbers.findIndex(b => b.id === barberId);
        if(index !== -1) {
            db.barbers[index] = barberData;
        }
    } else {
        // Adicionar novo
        db.barbers.push(barberData);
    }
    
    saveDB();
    $('#barberModal').modal('hide');
    renderBarbersList();
    alert('✅ Barbeiro salvo com sucesso!');
}

function deleteBarber(barberId) {
    const barber = db.barbers.find(b => b.id === barberId);
    if(!barber) return;
    
    // Verifica se tem agendamentos
    const hasAppointments = db.appointments.some(a => a.barberId === barberId);
    
    if(hasAppointments) {
        if(!confirm(`⚠️ ${barber.name} possui agendamentos registrados.\n\nDeseja realmente excluir? (Recomendamos desativar ao invés de excluir)`)) {
            return;
        }
    }
    
    if(confirm(`Excluir ${barber.name}?`)) {
        db.barbers = db.barbers.filter(b => b.id !== barberId);
        saveDB();
        renderBarbersList();
        alert('✅ Barbeiro excluído!');
    }
}

// =========================================
// GERENCIAMENTO DE SERVIÇOS
// =========================================

function renderServicesList() {
    const container = $('#services-list');
    container.empty();
    
    if(db.services.length === 0) {
        container.html('<div class="col-12"><p class="text-center text-muted">Nenhum serviço cadastrado.</p></div>');
        return;
    }
    
    db.services.forEach(service => {
        const statusBadge = service.active ? 
            '<span class="badge badge-success">Ativo</span>' : 
            '<span class="badge badge-secondary">Inativo</span>';
        
        container.append(`
            <div class="col-md-4 mb-4">
                <div class="admin-card">
                    <div class="admin-card-body text-center">
                        <i class="fas fa-scissors fa-3x mb-3" style="color: #667eea;"></i>
                        <h5>${service.name}</h5>
                        <h3 class="text-success mb-2">R$ ${service.price.toFixed(2)}</h3>
                        <p class="text-muted small">${service.description || 'Sem descrição'}</p>
                        <p class="small"><i class="fas fa-clock"></i> ${service.duration} minutos</p>
                        ${statusBadge}
                        <hr>
                        <div class="btn-group btn-block">
                            <button class="btn btn-primary btn-sm" onclick="editService('${service.id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteService('${service.id}')">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    });
}

function openServiceModal(serviceId = null) {
    if(serviceId) {
        const service = db.services.find(s => s.id === serviceId);
        if(!service) return;
        
        $('#service-modal-title').text('Editar Serviço');
        $('#service-id').val(service.id);
        $('#service-name').val(service.name);
        $('#service-price').val(service.price);
        $('#service-duration').val(service.duration);
        $('#service-description').val(service.description);
        $('#service-active').prop('checked', service.active);
    } else {
        $('#service-modal-title').text('Novo Serviço');
        $('#service-id').val('');
        $('#service-name').val('');
        $('#service-price').val('');
        $('#service-duration').val('30');
        $('#service-description').val('');
        $('#service-active').prop('checked', true);
    }
    
    $('#serviceModal').modal('show');
}

function editService(serviceId) {
    openServiceModal(serviceId);
}

function saveService() {
    const name = $('#service-name').val().trim();
    const price = parseFloat($('#service-price').val());
    
    if(!name) {
        alert('⚠️ O nome do serviço é obrigatório!');
        return;
    }
    
    if(!price || price <= 0) {
        alert('⚠️ Digite um preço válido!');
        return;
    }
    
    const serviceId = $('#service-id').val();
    const serviceData = {
        id: serviceId || 's' + Date.now(),
        name: name,
        price: price,
        duration: parseInt($('#service-duration').val()) || 30,
        description: $('#service-description').val().trim(),
        active: $('#service-active').is(':checked')
    };
    
    if(serviceId) {
        const index = db.services.findIndex(s => s.id === serviceId);
        if(index !== -1) {
            db.services[index] = serviceData;
        }
    } else {
        db.services.push(serviceData);
    }
    
    saveDB();
    $('#serviceModal').modal('hide');
    renderServicesList();
    alert('✅ Serviço salvo com sucesso!');
}

function deleteService(serviceId) {
    const service = db.services.find(s => s.id === serviceId);
    if(!service) return;
    
    if(confirm(`Excluir serviço "${service.name}"?`)) {
        db.services = db.services.filter(s => s.id !== serviceId);
        saveDB();
        renderServicesList();
        alert('✅ Serviço excluído!');
    }
}

// =========================================
// CONFIGURAÇÕES E PAGAMENTOS
// =========================================

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
    alert('✅ Configurações salvas com sucesso!');
}

function savePaymentConfig() {
    db.payments.mercadoPago.accessToken = $('#mp-access-token').val().trim();
    db.payments.mercadoPago.publicKey = $('#mp-public-key').val().trim();
    db.payments.mercadoPago.active = $('#mp-active').is(':checked');
    
    saveDB();
    alert('✅ Configurações de pagamento salvas!');
}

function changePassword() {
    const newPass = $('#new-password').val();
    const confirmPass = $('#confirm-password').val();
    
    if(!newPass || newPass.length < 4) {
        alert('⚠️ A senha deve ter pelo menos 4 caracteres!');
        return;
    }
    
    if(newPass !== confirmPass) {
        alert('⚠️ As senhas não coincidem!');
        return;
    }
    
    db.config.password = newPass;
    saveDB();
    
    $('#new-password').val('');
    $('#confirm-password').val('');
    
    alert('✅ Senha alterada com sucesso!');
}

// =========================================
// RELATÓRIOS
// =========================================

function generateReport() {
    const period = $('#report-period').val();
    let startDate, endDate;
    
    const today = new Date();
    
    switch(period) {
        case 'today':
            startDate = endDate = today.toISOString().split('T')[0];
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - 7);
            startDate = weekStart.toISOString().split('T')[0];
            endDate = today.toISOString().split('T')[0];
            break;
        case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate = monthStart.toISOString().split('T')[0];
            endDate = today.toISOString().split('T')[0];
            break;
        case 'custom':
            startDate = $('#report-start').val();
            endDate = $('#report-end').val();
            if(!startDate || !endDate) {
                alert('⚠️ Selecione as datas inicial e final!');
                return;
            }
            break;
    }
    
    const filteredAppts = db.appointments.filter(a => {
        return a.date >= startDate && a.date <= endDate && a.status !== 'cancelled';
    });
    
    let totalRevenue = 0;
    let paidOnline = 0;
    let paidLocal = 0;
    let pending = 0;
    
    filteredAppts.forEach(a => {
        if(a.paymentStatus === 'paid_online') {
            totalRevenue += a.price;
            paidOnline += a.price;
        } else if(a.paymentStatus === 'paid') {
            totalRevenue += a.price;
            paidLocal += a.price;
        } else {
            pending += a.price;
        }
    });
    
    // Ranking de barbeiros
    const barberStats = {};
    filteredAppts.forEach(a => {
        if(!barberStats[a.barberId]) {
            const barber = db.barbers.find(b => b.id === a.barberId);
            barberStats[a.barberId] = {
                name: barber ? barber.name : 'N/A',
                count: 0,
                revenue: 0
            };
        }
        barberStats[a.barberId].count++;
        if(a.paymentStatus === 'paid_online' || a.paymentStatus === 'paid') {
            barberStats[a.barberId].revenue += a.price;
        }
    });
    
    const barberRanking = Object.values(barberStats).sort((a, b) => b.revenue - a.revenue);
    
    let rankingHTML = '';
    barberRanking.forEach((b, index) => {
        rankingHTML += `
            <tr>
                <td><strong>#${index + 1}</strong></td>
                <td>${b.name}</td>
                <td>${b.count}</td>
                <td><strong>R$ ${b.revenue.toFixed(2)}</strong></td>
            </tr>
        `;
    });
    
    $('#report-content').html(`
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card blue">
                    <div class="stat-content">
                        <div class="stat-value">${filteredAppts.length}</div>
                        <div class="stat-label">Total de Atendimentos</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card green">
                    <div class="stat-content">
                        <div class="stat-value">R$ ${totalRevenue.toFixed(2)}</div>
                        <div class="stat-label">Receita Total</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card purple">
                    <div class="stat-content">
                        <div class="stat-value">R$ ${paidOnline.toFixed(2)}</div>
                        <div class="stat-label">Pago Online</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card orange">
                    <div class="stat-content">
                        <div class="stat-value">R$ ${pending.toFixed(2)}</div>
                        <div class="stat-label">Pendente</div>
                    </div>
                </div>
            </div>
        </div>
        
        <h5 class="mb-3"><i class="fas fa-trophy"></i> Ranking de Barbeiros</h5>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Posição</th>
                        <th>Barbeiro</th>
                        <th>Atendimentos</th>
                        <th>Receita</th>
                    </tr>
                </thead>
                <tbody>
                    ${rankingHTML || '<tr><td colspan="4" class="text-center text-muted">Nenhum dado disponível</td></tr>'}
                </tbody>
            </table>
        </div>
    `);
}

// =========================================
// UTILITÁRIOS
// =========================================

function exportData() {
    const dataStr = JSON.stringify(db, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barbearia_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Dados exportados com sucesso!');
}

function resetSystem() {
    if(confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados!\n\nDeseja realmente continuar?')) {
        if(confirm('🚨 ÚLTIMA CONFIRMAÇÃO: Os dados não poderão ser recuperados!')) {
            localStorage.removeItem('barberDB_v4');
            alert('✅ Sistema resetado! A página será recarregada.');
            location.reload();
        }
    }
}

// =========================================
// INICIALIZAÇÃO
// =========================================

// Detecta qual página está sendo carregada
$(document).ready(function() {
    // Adiciona o script admin ao script principal
    if(typeof initAdmin === 'function') {
        console.log('✅ Sistema Administrativo carregado');
    }
    if(typeof initClient === 'function') {
        console.log('✅ Sistema do Cliente carregado');
    }
});