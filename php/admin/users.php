<?php
// php/admin/users.php
header('Content-Type: application/json');
require_once '../db_connection.php';
session_start();

if (!isset($_SESSION['role']) || ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'super_admin')) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List Users (and Admins? Spec says "Users Management". Usually strictly customers).
    // Let's list customers.
    $sql = "SELECT user_id as id, full_name as name, email, 'customer' as role FROM users";
    $result = $conn->query($sql);
    $users = [];
    while($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    // Maybe append admins if super admin?
    // $users = array_merge($users, admins...)
    
    echo json_encode($users);
    exit;
}

if ($method === 'POST') {
    // Delete User
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'];
    
    // Check if valid ID
    $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    $stmt->close();
}
?>
