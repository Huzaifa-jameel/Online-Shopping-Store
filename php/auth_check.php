<?php
// php/auth_check.php
session_start();
header('Content-Type: application/json');

// Check if not logged in but cookie exists
if (!isset($_SESSION['user_id']) && !isset($_SESSION['admin_id']) && isset($_COOKIE['remember_me'])) {
    require_once 'db_connection.php';
    
    list($selector, $validator) = explode(':', $_COOKIE['remember_me']);
    
    $stmt = $conn->prepare("SELECT id, user_id, user_type, hashed_validator FROM auth_tokens WHERE selector = ? AND expiry > NOW()");
    $stmt->bind_param("s", $selector);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $token = $result->fetch_assoc();
        if (password_verify($validator, $token['hashed_validator'])) {
            // Valid token, log user in
            if ($token['user_type'] === 'user') {
                $u_stmt = $conn->prepare("SELECT full_name FROM users WHERE user_id = ?");
                $u_stmt->bind_param("i", $token['user_id']);
                $u_stmt->execute();
                $u_res = $u_stmt->get_result();
                if ($u_res->num_rows === 1) {
                    $u_data = $u_res->fetch_assoc();
                    $_SESSION['user_id'] = $token['user_id'];
                    $_SESSION['user_name'] = $u_data['full_name'];
                    $_SESSION['role'] = 'user';
                }
                $u_stmt->close();
            } elseif ($token['user_type'] === 'admin') {
                $a_stmt = $conn->prepare("SELECT name, role FROM admin_accounts WHERE admin_id = ?");
                $a_stmt->bind_param("i", $token['user_id']);
                $a_stmt->execute();
                $a_res = $a_stmt->get_result();
                if ($a_res->num_rows === 1) {
                    $a_data = $a_res->fetch_assoc();
                    $_SESSION['admin_id'] = $token['user_id'];
                    $_SESSION['admin_name'] = $a_data['name'];
                    $_SESSION['role'] = $a_data['role'];
                }
                $a_stmt->close();
            }
            
            // Optionally rotate token (Security Best Practice: Update Validator)
            // For now, simpler to just keep it valid or refresh expiry.
        }
    }
    $stmt->close();
}

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'role' => 'user',
        'user_id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name']
    ]);
} elseif (isset($_SESSION['admin_id'])) {
    echo json_encode([
        'logged_in' => true,
        'role' => $_SESSION['role'] ?? 'admin', // Use session role
        'user_id' => $_SESSION['admin_id'],
        'name' => $_SESSION['admin_name']
    ]);
} else {
    echo json_encode([
        'logged_in' => false
    ]);
}
?>
