const app = {
    // --- Banco de Dados Default ---
    db: {
        config: { name: "Barbearia Vip", color: "#d4af37", start: 9, end: 19, duration: 45 },
        appointments: []
    },

    // --- Inicialização ---
    loadDB: function() {
        const saved = localStorage.getItem('barberPremiumDB');
        if (saved) this.db = JSON.parse(saved);
        this.applyTheme();
    },

    saveDB: function() {
        localStorage.setItem('barberPremiumDB', JSON.stringify(this.db));
        this.applyTheme();
    },

    applyTheme: function() {
        document.documentElement.style.setProperty('--primary', this.db.config.color);
        const navTitle = document.getElementById('nav-shop-name');
        if(navTitle) navTitle.innerText = this.db.config.name;
        document.title = this.db.config.name + " - Agendamento";
    },

    // --- Funções do Cliente ---
    initClient: function() {
        this.loadDB();
        const today = new Date().toISOString().split('T')[0];
        $('#client-date').val(today);
        $('#client-date').on('change', () => this.renderSlots());
        this.renderSlots();
    },

    renderSlots: function() {
        const date = $('#client-date').val();
        const area = $('#slots-area');
        area.empty();

        if (!date) return;

        const { start, end, duration } = this.db.config;
        const takenTimes = this.db.appointments
            .filter(a => a.date === date)
            .map(a => a.time);

        // Gerar horários
        let count = 0;
        for (let h = parseInt(start); h < parseInt(end); h++) {
            for (let m = 0; m < 60; m += parseInt(duration)) {
                if(h >= parseInt(end)) break;

                const time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                const isTaken = takenTimes.includes(time);
                
                const card = `
                <div class="col-6 col-md-4 col-lg-3 fade-in" style="animation-delay: ${count * 0.05}s">
                    <div class="slot-btn ${isTaken ? 'booked' : ''}" onclick="${isTaken ? '' : `app.book('${time}')`}">
                        <h5>${time}</h5>
                        <small>${isTaken ? 'Reservado' : 'Disponível'}</small>
                        ${isTaken ? '' : '<div class="mt-2 text-primary font-weight-bold"><i class="fas fa-check-circle"></i> Agendar</div>'}
                    </div>
                </div>`;
                area.append(card);
                count++;
            }
        }
        if(count === 0) area.html('<p class="text-muted">Nenhum horário disponível com essa configuração.</p>');
    },

    book: function(time) {
        const name = $('#client-name').val();
        const date = $('#client-date').val();

        if(!name) {
            alert('Por favor, digite seu nome primeiro!');
            $('#client-name').focus();
            return;
        }

        if(confirm(`Confirmar agendamento para ${name} às ${time}?`)) {
            this.db.appointments.push({
                client: name, date: date, time: time, created: new Date().toISOString()
            });
            this.saveDB();
            this.renderSlots();
            alert('Agendamento realizado com sucesso! Te esperamos lá.');
            $('#client-name').val('');
        }
    },

    // --- Funções do Admin ---
    initAdmin: function() {
        this.loadDB();
        
        // Preencher configs
        $('#cfg-name').val(this.db.config.name);
        $('#cfg-color').val(this.db.config.color);
        $('#cfg-start').val(this.db.config.start);
        $('#cfg-end').val(this.db.config.end);
        $('#cfg-duration').val(this.db.config.duration);

        // Data hoje
        const today = new Date().toISOString().split('T')[0];
        $('#admin-date').val(today);
        $('#admin-date').on('change', function() { app.renderAdminList(this.value); });
    },

    checkLogin: function() {
        if($('#admin-pass').val() === 'admin') {
            $('#login-overlay').fadeOut();
            $('#admin-panel').removeClass('hidden');
            this.renderAdminList($('#admin-date').val());
        } else {
            alert('Senha incorreta! (Dica: admin)');
        }
    },

    saveSettings: function() {
        this.db.config = {
            name: $('#cfg-name').val(),
            color: $('#cfg-color').val(),
            start: $('#cfg-start').val(),
            end: $('#cfg-end').val(),
            duration: $('#cfg-duration').val()
        };
        this.saveDB();
        alert('Configurações salvas! A loja foi atualizada.');
    },

    renderAdminList: function(date) {
        const list = $('#appt-list');
        list.empty();
        
        const appts = this.db.appointments.filter(a => a.date === date);
        appts.sort((a,b) => a.time.localeCompare(b.time));

        if(appts.length === 0) {
            list.html('<li class="list-group-item text-center text-muted py-4">Nenhum agendamento para hoje.</li>');
            return;
        }

        appts.forEach(a => {
            list.append(`
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="mr-3 bg-light rounded p-2 text-center" style="width:60px">
                        <strong class="text-primary d-block">${a.time}</strong>
                    </div>
                    <div>
                        <h6 class="mb-0 font-weight-bold">${a.client}</h6>
                        <small class="text-muted"><i class="fas fa-clock"></i> Agendado em: ${new Date(a.created).toLocaleDateString()}</small>
                    </div>
                </div>
                <button class="btn btn-outline-danger btn-sm rounded-circle" onclick="app.cancel('${a.date}', '${a.time}')" title="Cancelar">
                    <i class="fas fa-times"></i>
                </button>
            </li>`);
        });
    },

    cancel: function(date, time) {
        if(confirm('Tem certeza que deseja cancelar?')) {
            this.db.appointments = this.db.appointments.filter(a => !(a.date === date && a.time === time));
            this.saveDB();
            this.renderAdminList(date);
        }
    },

    resetDB: function() {
        if(confirm('ATENÇÃO: Isso apagará TODOS os dados. Continuar?')) {
            localStorage.removeItem('barberPremiumDB');
            location.reload();
        }
    }
};