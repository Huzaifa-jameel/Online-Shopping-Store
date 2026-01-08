<?php
// Include the connection file
require_once 'db_connection.php';

// If we reached here, the connection inside db_connection.php was successful
// because it dies on error.
echo "<h1>Database Connection Successful! ✅</h1>";
echo "<p>Connected to database: <strong>" . $dbname . "</strong></p>";
echo "<p>Host: <strong>" . $servername . "</strong></p>";

// Close the connection for this test
$conn->close();
?>
