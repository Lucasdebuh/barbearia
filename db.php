<?php
// PHP 7.4.7 + PostgreSQL 12.3.1
$host = 'localhost';
$db   = 'barber_web_db';
$user = 'postgres';
$pass = 'senha'; // Altere para sua senha do Postgres

try {
    $pdo = new PDO("pgsql:host=$host;port=5432;dbname=$db;", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Erro de Conexão com Postgres: " . $e->getMessage());
}
?>