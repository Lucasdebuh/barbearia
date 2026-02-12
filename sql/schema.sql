-- Banco: PostgreSQL 12.3.1
CREATE TABLE config (
    id SERIAL PRIMARY KEY,
    shop_name VARCHAR(100) DEFAULT 'Minha Barbearia',
    theme_color VARCHAR(20) DEFAULT '#343a40',
    duration INT DEFAULT 30, -- Duração do corte em minutos
    start_hour INT DEFAULT 9,
    end_hour INT DEFAULT 19,
    admin_pass VARCHAR(100) DEFAULT 'admin' -- Senha simples para teste
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    appt_date DATE NOT NULL,
    appt_time VARCHAR(5) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuração Inicial
INSERT INTO config (shop_name) VALUES ('Barbearia Clássica');