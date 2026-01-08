<?php
// php/auth_login.php
session_start();
header('Content-Type: application/json');
require_once 'db_connection.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

// 1. Check USERS table
$stmt = $conn->prepare("SELECT user_id, full_name, password_hash FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password_hash'])) {
        // Login success as USER
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['role'] = 'user';
        
        // Remember Me Logic
        if (!empty($input['remember_me'])) {
            $selector = bin2hex(random_bytes(16));
            $validator = bin2hex(random_bytes(32));
            $hashed_validator = password_hash($validator, PASSWORD_DEFAULT);
            $expiry = date('Y-m-d H:i:s', time() + (86400 * 30)); // 30 days

            $insert_stmt = $conn->prepare("INSERT INTO auth_tokens (user_id, user_type, selector, hashed_validator, expiry) VALUES (?, 'user', ?, ?, ?)");
            $insert_stmt->bind_param("isss", $user['user_id'], $selector, $hashed_validator, $expiry);
            if ($insert_stmt->execute()) {
                setcookie('remember_me', "$selector:$validator", time() + (86400 * 30), "/", "", false, true); // HTTPOnly
            }
            $insert_stmt->close();
        }

        echo json_encode(['success' => true, 'role' => 'user', 'message' => 'Login successful']);
        $stmt->close();
        exit;
    }
}
$stmt->close();

// 2. Check ADMIN_ACCOUNTS table
$stmt = $conn->prepare("SELECT admin_id, name, password_hash, role FROM admin_accounts WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $admin = $result->fetch_assoc();
    if (password_verify($password, $admin['password_hash'])) {
        // Login success as ADMIN
        $_SESSION['admin_id'] = $admin['admin_id'];
        $_SESSION['admin_name'] = $admin['name'];
        $_SESSION['role'] = $admin['role']; // 'admin' or 'super_admin'
        
        // Remember Me Logic
        if (!empty($input['remember_me'])) {
            $selector = bin2hex(random_bytes(16));
            $validator = bin2hex(random_bytes(32));
            $hashed_validator = password_hash($validator, PASSWORD_DEFAULT);
            $expiry = date('Y-m-d H:i:s', time() + (86400 * 30)); // 30 days

            $insert_stmt = $conn->prepare("INSERT INTO auth_tokens (user_id, user_type, selector, hashed_validator, expiry) VALUES (?, 'admin', ?, ?, ?)");
            $insert_stmt->bind_param("isss", $admin['admin_id'], $selector, $hashed_validator, $expiry);
            if ($insert_stmt->execute()) {
                setcookie('remember_me', "$selector:$validator", time() + (86400 * 30), "/", "", false, true); // HTTPOnly
            }
            $insert_stmt->close();
        }

        echo json_encode(['success' => true, 'role' => 'admin', 'message' => 'Admin login successful']);
        $stmt->close();
        exit;
    }
}
$stmt->close();

// Login failed
echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
$conn->close();
?>
