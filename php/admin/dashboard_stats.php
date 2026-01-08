<?php
// php/admin/dashboard_stats.php
header('Content-Type: application/json');
require_once '../db_connection.php';
session_start();

// Simple auth check
if (!isset($_SESSION['role']) || ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'super_admin')) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$response = [];

// 1. Total Sales (sum of 'total_price' from orders excluding cancelled)
$sql = "SELECT SUM(total_price) as total_sales FROM orders WHERE status != 'cancelled'";
$result = $conn->query($sql);
$response['total_sales'] = $result->fetch_assoc()['total_sales'] ?? 0;

// 2. Total Products
$sql = "SELECT COUNT(*) as total_products FROM products";
$result = $conn->query($sql);
$response['total_products'] = $result->fetch_assoc()['total_products'] ?? 0;

// 3. Pending Orders
$sql = "SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending'";
$result = $conn->query($sql);
$response['pending_orders'] = $result->fetch_assoc()['pending_orders'] ?? 0;

// 4. Low Stock (less than 10)
$sql = "SELECT COUNT(*) as low_stock FROM products WHERE quantity < 10";
$result = $conn->query($sql);
$response['low_stock_count'] = $result->fetch_assoc()['low_stock'] ?? 0;

// 5. Recent Orders (Top 5)
$sql = "SELECT o.order_id, u.full_name, o.total_price, o.status 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.user_id 
        ORDER BY o.created_at DESC LIMIT 5";
$result = $conn->query($sql);
$recent_orders = [];
while($row = $result->fetch_assoc()) {
    $recent_orders[] = $row;
}
$response['recent_orders'] = $recent_orders;

// 6. Top Selling (Mock logic: just random or order by most ordered if table exists? 
// For real implementation: group by order_items.product_id.
// Complex query, let's keep it robust.
$sql = "SELECT p.name, SUM(oi.quantity) as sold 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.product_id 
        GROUP BY oi.product_id 
        ORDER BY sold DESC LIMIT 5";
$result = $conn->query($sql);
$top_selling = [];
while($row = $result->fetch_assoc()) {
    $top_selling[] = $row;
}
$response['top_selling'] = $top_selling;

// 7. Low Stock List
$sql = "SELECT name, quantity, sizes FROM products WHERE quantity < 10 LIMIT 5";
$result = $conn->query($sql);
$low_stock_list = [];
while($row = $result->fetch_assoc()) {
    // Sizes is JSON
    $sizes = json_decode($row['sizes'], true);
    $row['size_display'] = !empty($sizes) ? $sizes[0] : '-';
    $low_stock_list[] = $row;
}
$response['low_stock_list'] = $low_stock_list;


echo json_encode($response);
$conn->close();
?>
