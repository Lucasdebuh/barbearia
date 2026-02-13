const defaultDB={config:{name:"Barbearia Premium",color:"#e94560",start:9,end:19,duration:45},appointments:[],users:[]};
let db=JSON.parse(localStorage.getItem('barberPremiumFinal'))||defaultDB;
let currentUser=JSON.parse(sessionStorage.getItem('barberCurrentUser'))||null;
let updateInterval=null;

function saveDB(){localStorage.setItem('barberPremiumFinal',JSON.stringify(db));applyTheme();}
function applyTheme(){
    document.documentElement.style.setProperty('--gold',db.config.color);
    const els=['nav-shop-name'];
    els.forEach(id=>{const el=document.getElementById(id);if(el)el.innerText=db.config.name;});
    if(!document.title.includes("Admin")) document.title=db.config.name;
}

// AUTH
function openAuthModal(m){$('#auth-modal').fadeIn(200).css('display','flex');toggleAuthForms(m);}
function closeAuthModal(){$('#auth-modal').fadeOut(200);}
function toggleAuthForms(m){if(m==='login'){$('#form-login').show();$('#form-register').hide();}else{$('#form-login').hide();$('#form-register').show();}}

function register(){
    const n=$('#reg-name').val().trim(),p=$('#reg-phone').val().trim(),e=$('#reg-email').val().trim(),pw=$('#reg-pass').val().trim();
    if(!n||!p||!e||!pw) return alert('Preencha tudo!');
    if(db.users.find(u=>u.email===e)) return alert('Email já existe.');
    const u={name:n,phone:p,email:e,pass:pw};
    db.users.push(u);saveDB();loginUser(u);closeAuthModal();
}
function login(){
    const e=$('#login-email').val().trim(),p=$('#login-pass').val().trim();
    const u=db.users.find(User=>User.email===e&&User.pass===p);
    if(u){loginUser(u);closeAuthModal();}else{alert('Erro no login.');}
}
function loginUser(u){currentUser=u;sessionStorage.setItem('barberCurrentUser',JSON.stringify(u));updateClientUI();const d=$('#client-date').val();if(d)renderSlots(d);}
function logout(){currentUser=null;sessionStorage.removeItem('barberCurrentUser');window.location.reload();}

function editProfile(){
    if(!currentUser)return;
    const n=prompt("Nome:",currentUser.name),p=prompt("Tel:",currentUser.phone);
    if(n&&p){
        currentUser.name=n;currentUser.phone=p;
        const i=db.users.findIndex(u=>u.email===currentUser.email);
        if(i!==-1){db.users[i]=currentUser;saveDB();sessionStorage.setItem('barberCurrentUser',JSON.stringify(currentUser));updateClientUI();}
    }
}

function updateClientUI(){
    if(currentUser){
        $('#user-area-guest').hide();$('#user-area-logged').addClass('d-flex').show();
        $('#display-username').text(currentUser.name);
        $('#guest-alert').hide();$('#logged-user-info').show();
        $('#info-client-name').text(currentUser.name);$('#info-client-phone').text(currentUser.phone);
    }else{
        $('#user-area-guest').show();$('#user-area-logged').removeClass('d-flex').hide();
        $('#guest-alert').show();$('#logged-user-info').hide();
    }
}

// CLIENT
function initClient(){
    applyTheme();updateClientUI();
    const t=new Date().toISOString().split('T')[0];
    $('#client-date').val(t).attr('min',t);
    $('#client-date').on('change',function(){renderSlots(this.value);});
    renderSlots(t);
}
function renderSlots(d){
    if(!d)return;
    // Reload DB for freshness
    db=JSON.parse(localStorage.getItem('barberPremiumFinal'))||defaultDB;
    const area=$('#slots-area');area.empty();
    const cfg=db.config;
    const taken=db.appointments.filter(a=>a.date===d).map(a=>a.time);
    let has=false;

    for(let h=parseInt(cfg.start);h<parseInt(cfg.end);h++){
        for(let m=0;m<60;m+=parseInt(cfg.duration)){
            let time=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            let isTaken=taken.includes(time);
            let action=!isTaken?(currentUser?`onclick="book('${d}','${time}')"`:`onclick="openAuthModal('login')"`):'';
            let cls=isTaken?'booked':(currentUser?'':'locked');
            let txt=isTaken?'Ocupado':(currentUser?'Livre':'Entrar');
            let ico=!isTaken&&!currentUser?'<i class="fas fa-lock ml-1" style="font-size:0.7em"></i>':'';
            
            area.append(`
                <div class="col-4 col-md-3">
                    <div class="slot-btn ${cls}" ${action}>
                        <h6>${time}</h6>
                        <small>${txt} ${ico}</small>
                    </div>
                </div>
            `);
            has=true;
        }
    }
    if(!has) area.html('<p class="text-center w-100 py-3 text-muted">Fechado.</p>');
}
function book(d,t){
    if(!currentUser)return openAuthModal('login');
    if(confirm(`Agendar dia ${d} às ${t}?`)){
        db.appointments.push({date:d,time:t,client:currentUser.name,phone:currentUser.phone});
        saveDB();renderSlots(d);alert('Confirmado!');
    }
}

// ADMIN
function initAdmin(){
    applyTheme();
    $('#cfg-name').val(db.config.name);$('#cfg-color').val(db.config.color);
    $('#cfg-start').val(db.config.start);$('#cfg-end').val(db.config.end);$('#cfg-duration').val(db.config.duration);
    $('#cfg-color').on('input',function(){applyTheme();}); // Live preview
    const t=new Date().toISOString().split('T')[0];
    $('#admin-date').val(t);
    $('#admin-date').on('change',function(){renderAdminList(this.value);});
}
function checkLogin(){
    if($('#admin-pass').val()==='admin'){
        $('#login-overlay').fadeOut();
        renderAdminList($('#admin-date').val());
        setInterval(()=>{ // AUTO UPDATE
            const d=$('#admin-date').val();
            if(d){
                const fresh=JSON.parse(localStorage.getItem('barberPremiumFinal'));
                if(fresh){db.appointments=fresh.appointments;renderAdminList(d);}
            }
        },5000);
    }else alert('Senha incorreta');
}
function saveSettings(){
    db.config.name=$('#cfg-name').val();db.config.color=$('#cfg-color').val();
    db.config.start=$('#cfg-start').val();db.config.end=$('#cfg-end').val();db.config.duration=$('#cfg-duration').val();
    saveDB();alert('Salvo!');
}
function renderAdminList(d){
    const l=$('#appt-list');l.empty();
    const appts=db.appointments.filter(a=>a.date===d);
    appts.sort((a,b)=>a.time.localeCompare(b.time));
    if(appts.length===0) return l.html('<li class="text-center py-5 text-muted">Vazio</li>');
    appts.forEach(a=>{
        l.append(`<li class="list-group-item d-flex justify-content-between align-items-center">
            <div><span class="badge badge-dark mr-2">${a.time}</span><b>${a.client}</b> <small class="text-muted ml-2">${a.phone}</small></div>
            <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="cancel('${a.date}','${a.time}')"><i class="fas fa-times"></i></button>
        </li>`);
    });
}
function cancel(d,t){if(confirm('Cancelar?')){db.appointments=db.appointments.filter(a=>!(a.date===d&&a.time===t));saveDB();renderAdminList(d);}}
function resetDB(){if(confirm('Resetar?')){localStorage.removeItem('barberPremiumFinal');location.reload();}}