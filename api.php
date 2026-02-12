<?php
require 'db.php';
header('Content-Type: application/json');

$action = $_POST['action'] ?? '';

// 1. Ler Configurações
if ($action === 'get_config') {
    $stmt = $pdo->query("SELECT * FROM config LIMIT 1");
    echo json_encode($stmt->fetch());
    exit;
}

// 2. Salvar Configurações (Admin)
if ($action === 'save_config') {
    $sql = "UPDATE config SET shop_name=?, theme_color=?, duration=?, start_hour=?, end_hour=? WHERE id=1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $_POST['name'], $_POST['color'], $_POST['duration'], $_POST['start'], $_POST['end']
    ]);
    echo json_encode(['status' => 'success']);
    exit;
}

// 3. Login Simples
if ($action === 'login') {
    $stmt = $pdo->prepare("SELECT * FROM config WHERE admin_pass = ?");
    $stmt->execute([$_POST['pass']]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
    exit;
}

// 4. Buscar Agendamentos de um dia
if ($action === 'get_slots') {
    $date = $_POST['date'];
    
    // Pega config
    $cfg = $pdo->query("SELECT * FROM config LIMIT 1")->fetch();
    
    // Pega agendamentos já feitos
    $stmt = $pdo->prepare("SELECT appt_time FROM appointments WHERE appt_date = ?");
    $stmt->execute([$date]);
    $booked = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Gera slots
    $slots = [];
    $start = (int)$cfg['start_hour'];
    $end   = (int)$cfg['end_hour'];
    $dur   = (int)$cfg['duration'];
    
    for ($h = $start; $h < $end; $h++) {
        for ($m = 0; $m < 60; $m += $dur) {
            $time = sprintf("%02d:%02d", $h, $m);
            $status = in_array($time, $booked) ? 'occupied' : 'free';
            $slots[] = ['time' => $time, 'status' => $status];
        }
    }
    echo json_encode($slots);
    exit;
}

// 5. Agendar
if ($action === 'book') {
    $sql = "INSERT INTO appointments (client_name, appt_date, appt_time) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([$_POST['name'], $_POST['date'], $_POST['time']]);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
    }
    exit;
}
?>