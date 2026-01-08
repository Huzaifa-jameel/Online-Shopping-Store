<?php
// Database Configuration
$servername = "localhost";
$username = "root";        // Default XAMPP username
$password = "";            // Default XAMPP password is empty
$dbname = "clothing_store";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Optional: Set charset to utf8mb4 for better compatibility
$conn->set_charset("utf8mb4");

// NOTE: Do not close the connection here if this file is included in other scripts
// $conn->close();
?>
