<?php
// php/auth_logout.php
session_start();
require_once 'db_connection.php';

if (isset($_COOKIE['remember_me'])) {
    list($selector, $validator) = explode(':', $_COOKIE['remember_me']);
    
    // Delete from DB
    $stmt = $conn->prepare("DELETE FROM auth_tokens WHERE selector = ?");
    $stmt->bind_param("s", $selector);
    $stmt->execute();
    $stmt->close();
    
    // Delete Cookie
    setcookie('remember_me', '', time() - 3600, '/', "", false, true);
    unset($_COOKIE['remember_me']);
}

session_unset();
session_destroy();
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>
