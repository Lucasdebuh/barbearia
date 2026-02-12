<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carregando...</title>
    
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css">
    
    <style>
        body { background-color: #f8f9fa; }
        .navbar-brand { font-weight: bold; }
        .card { box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: none; }
        .slot { cursor: pointer; transition: 0.2s; }
        .slot:hover { transform: scale(1.05); }
        .slot.occupied { background-color: #e9ecef; color: #adb5bd; cursor: not-allowed; text-decoration: line-through; }
        .hidden { display: none; }
    </style>
</head>
<body>

    <nav class="navbar navbar-dark mb-4" id="main-nav">
        <div class="container">
            <span class="navbar-brand" id="nav-title">Barbearia</span>
            <button class="btn btn-outline-light btn-sm" onclick="showHome()">Sair / Início</button>
        </div>
    </nav>

    <div class="container">
        
        <div id="view-home" class="row justify-content-center">
            <div class="col-md-6 text-center">
                <div class="card p-5">
                    <h2 class="mb-4">Bem-vindo</h2>
                    <button class="btn btn-primary btn-lg btn-block mb-3" onclick="showClient()">
                        <i class="fas fa-cut"></i> Sou Cliente (Agendar)
                    </button>
                    <button class="btn btn-secondary btn-lg btn-block" onclick="showLogin()">
                        <i class="fas fa-user-tie"></i> Sou Barbeiro (Admin)
                    </button>
                </div>
            </div>
        </div>

        <div id="view-login" class="row justify-content-center hidden">
            <div class="col-md-4">
                <div class="card p-4">
                    <h4>Acesso Restrito</h4>
                    <div class="form-group">
                        <input type="password" id="admin-pass" class="form-control" placeholder="Senha do Admin">
                    </div>
                    <button class="btn btn-dark btn-block" onclick="doLogin()">Entrar</button>
                </div>
            </div>
        </div>

        <div id="view-admin" class="hidden">
            <div class="row">
                <div class="col-md-12">
                    <div class="card p-4 mb-3">
                        <h4><i class="fas fa-cogs"></i> Configurações da Loja</h4>
                        <div class="form-row">
                            <div class="col">
                                <label>Nome da Barbearia</label>
                                <input type="text" id="cfg-name" class="form-control">
                            </div>
                            <div class="col">
                                <label>Cor do Tema</label>
                                <input type="color" id="cfg-color" class="form-control" style="height: 38px;">
                            </div>
                        </div>
                        <div class="form-row mt-3">
                            <div class="col">
                                <label>Duração (min)</label>
                                <select id="cfg-duration" class="form-control">
                                    <option value="30">30 min</option>
                                    <option value="45">45 min</option>
                                    <option value="60">60 min</option>
                                </select>
                            </div>
                            <div class="col">
                                <label>Abre às (h)</label>
                                <input type="number" id="cfg-start" class="form-control">
                            </div>
                            <div class="col">
                                <label>Fecha às (h)</label>
                                <input type="number" id="cfg-end" class="form-control">
                            </div>
                        </div>
                        <button class="btn btn-success mt-3" onclick="saveConfig()">Salvar Alterações</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="view-client" class="hidden">
            <div class="card p-4">
                <h4 class="mb-3">Agendar Horário</h4>
                <div class="form-group">
                    <label>Seu Nome:</label>
                    <input type="text" id="client-name" class="form-control">
                </div>
                <div class="form-group">
                    <label>Data:</label>
                    <input type="date" id="client-date" class="form-control">
                </div>
                <hr>
                <h5>Horários Disponíveis:</h5>
                <div id="slots-container" class="row text-center mt-3">
                    <div class="col-12 text-muted">Selecione uma data acima.</div>
                </div>
            </div>
        </div>

    </div>

    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>
    
    <script>
        // --- LÓGICA FRONTEND ---
        
        $(document).ready(function() {
            loadConfig(); // Carrega cores e nomes ao iniciar
            
            // Listener da data do cliente
            $('#client-date').on('change', function() {
                loadSlots($(this).val());
            });
        });

        function loadConfig() {
            $.post('api.php', { action: 'get_config' }, function(data) {
                // Aplica visual
                $('#nav-title').text(data.shop_name);
                document.title = data.shop_name;
                $('#main-nav').css('background-color', data.theme_color);
                $('.btn-primary').css('background-color', data.theme_color).css('border-color', data.theme_color);
                
                // Preenche inputs do Admin
                $('#cfg-name').val(data.shop_name);
                $('#cfg-color').val(data.theme_color);
                $('#cfg-duration').val(data.duration);
                $('#cfg-start').val(data.start_hour);
                $('#cfg-end').val(data.end_hour);
            }, 'json');
        }

        // Navegação
        function hideAll() {
            $('#view-home, #view-login, #view-admin, #view-client').addClass('hidden');
        }
        function showHome() { hideAll(); $('#view-home').removeClass('hidden'); }
        function showLogin() { hideAll(); $('#view-login').removeClass('hidden'); }
        function showClient() { 
            hideAll(); 
            $('#view-client').removeClass('hidden'); 
            // Seta data de hoje
            var today = new Date().toISOString().split('T')[0];
            $('#client-date').val(today);
            loadSlots(today);
        }

        // Admin Actions
        function doLogin() {
            var pass = $('#admin-pass').val();
            $.post('api.php', { action: 'login', pass: pass }, function(res) {
                if(res.status === 'success') {
                    hideAll();
                    $('#view-admin').removeClass('hidden');
                } else {
                    alert('Senha incorreta!');
                }
            }, 'json');
        }

        function saveConfig() {
            var data = {
                action: 'save_config',
                name: $('#cfg-name').val(),
                color: $('#cfg-color').val(),
                duration: $('#cfg-duration').val(),
                start: $('#cfg-start').val(),
                end: $('#cfg-end').val()
            };
            $.post('api.php', data, function() {
                alert('Salvo!');
                loadConfig(); // Recarrega visual
            }, 'json');
        }

        // Cliente Actions
        function loadSlots(date) {
            if(!date) return;
            $('#slots-container').html('<div class="col-12">Carregando...</div>');
            
            $.post('api.php', { action: 'get_slots', date: date }, function(slots) {
                $('#slots-container').empty();
                if(slots.length === 0) {
                    $('#slots-container').html('<div class="col-12">Nenhum horário configurado.</div>');
                    return;
                }
                
                slots.forEach(function(s) {
                    var btnClass = s.status === 'free' ? 'btn-outline-success' : 'btn-secondary occupied';
                    var clickAttr = s.status === 'free' ? `onclick="bookSlot('${date}', '${s.time}')"` : '';
                    
                    var html = `
                        <div class="col-4 col-md-3 mb-2">
                            <button class="btn ${btnClass} btn-block slot" ${clickAttr}>
                                ${s.time}
                            </button>
                        </div>
                    `;
                    $('#slots-container').append(html);
                });
            }, 'json');
        }

        function bookSlot(date, time) {
            var name = $('#client-name').val();
            if(!name) { alert('Digite seu nome!'); return; }
            
            if(confirm('Agendar para ' + time + '?')) {
                $.post('api.php', { action: 'book', name: name, date: date, time: time }, function(res) {
                    if(res.status === 'success') {
                        alert('Agendado com sucesso!');
                        loadSlots(date); // Atualiza lista
                        $('#client-name').val('');
                    } else {
                        alert('Erro ao agendar.');
                    }
                }, 'json');
            }
        }
    </script>
</body>
</html>