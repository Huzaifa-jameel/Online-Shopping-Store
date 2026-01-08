<?php
// php/products.php
header('Content-Type: application/json');
require_once 'db_connection.php';

$category_id = $_GET['category_id'] ?? null;
$limit = $_GET['limit'] ?? 50;

$sql = "SELECT p.*, c.category_name, b.brand_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        WHERE 1=1";

if ($category_id) {
    $sql .= " AND p.category_id = " . intval($category_id);
}

// Fetch Single Product by ID
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $sql .= " AND p.product_id = $id";
    $result = $conn->query($sql);
    if ($result && $result->num_rows > 0) {
        $product = $result->fetch_assoc();
        // Decode JSON fields
        $product['sizes'] = !empty($product['sizes']) ? json_decode($product['sizes']) : [];
        $product['colors'] = !empty($product['colors']) ? json_decode($product['colors']) : [];
        // Add gallery images if you have a separate table, otherwise sticking to main_image for now or specific logic if needed. 
        // Assuming partial gallery support via conventions or extra fields if they existed, but for now we return the product.
        echo json_encode($product);
        $conn->close();
        exit;
    } else {
        echo json_encode(['error' => 'Product not found']);
        $conn->close();
        exit;
    }
}

// Filter by Feature/Sale
if (isset($_GET['is_feature']) && $_GET['is_feature'] == 1) {
    $sql .= " AND p.is_feature = 1";
}
if (isset($_GET['is_sale']) && $_GET['is_sale'] == 1) {
    $sql .= " AND p.is_sale = 1";
}

// Filter by Brand
if (isset($_GET['brand']) && !empty($_GET['brand'])) {
    $brand = $conn->real_escape_string($_GET['brand']);
    $sql .= " AND b.brand_code = '$brand'";
}

// Filter by Price
if (isset($_GET['min_price'])) {
    $min = (float)$_GET['min_price'];
    $sql .= " AND p.price >= $min";
}
if (isset($_GET['max_price'])) {
    $max = (float)$_GET['max_price'];
    $sql .= " AND p.price <= $max";
}

$sql .= " ORDER BY p.created_at DESC LIMIT " . intval($limit);

$result = $conn->query($sql);

$products = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        // Decode JSON fields
        $row['sizes'] = !empty($row['sizes']) ? json_decode($row['sizes']) : [];
        $row['colors'] = !empty($row['colors']) ? json_decode($row['colors']) : [];
        $products[] = $row;
    }
}

echo json_encode($products);
$conn->close();
?>
