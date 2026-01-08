<?php
// php/seed_admin.php
require_once 'db_connection.php';

$name = "Super Admin";
$email = "admin@ultras.com";
$password = "admin123";
$role = "super_admin";

// check if exists
$check = $conn->prepare("SELECT admin_id FROM admin_accounts WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo "Admin account already exists ($email).\n";
} else {
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO admin_accounts (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $password_hash, $role);
    
    if ($stmt->execute()) {
        echo "Admin account created successfully!\n";
        echo "Email: $email\n";
        echo "Password: $password\n";
    } else {
        echo "Error: " . $conn->error . "\n";
    }
}

$conn->close();
?>
