<?php
// php/search.php
header('Content-Type: application/json');
require_once 'db_connection.php';

$query = $_GET['q'] ?? '';

if (strlen($query) < 2) {
    echo json_encode([]);
    exit;
}

$searchTerm = "%" . $query . "%";

// Join with brands and categories to search by their names too
$sql = "SELECT p.product_id, p.name, p.price, p.main_image 
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.name LIKE ? 
           OR b.brand_name LIKE ? 
           OR c.category_name LIKE ?
        LIMIT 10";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $searchTerm, $searchTerm, $searchTerm);
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products);

$stmt->close();
$conn->close();
?>
