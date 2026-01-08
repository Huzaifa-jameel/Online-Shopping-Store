<?php
// php/admin/orders.php
header('Content-Type: application/json');
require_once '../db_connection.php';
session_start();

if (!isset($_SESSION['role']) || ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'super_admin')) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: List Orders
if ($method === 'GET') {
    $order_id = $_GET['id'] ?? null;

    if ($order_id) {
        // Get Single Order Details
        $stmt = $conn->prepare("SELECT o.*, u.full_name as customer, u.email 
                                FROM orders o 
                                JOIN users u ON o.user_id = u.user_id 
                                WHERE o.order_id = ?");
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
        $order = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        
        // Get Items
        $stmt = $conn->prepare("SELECT oi.*, p.name 
                                FROM order_items oi 
                                LEFT JOIN products p ON oi.product_id = p.product_id 
                                WHERE oi.order_id = ?");
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
        $items_res = $stmt->get_result();
        $items = [];
        while($row = $items_res->fetch_assoc()) {
            $items[] = $row;
        }
        $order['items'] = $items;
        
        echo json_encode($order);
    } else {
        // List All
        $sql = "SELECT o.order_id as id, u.full_name as customer, o.total_price as total, o.status, o.created_at 
                FROM orders o 
                JOIN users u ON o.user_id = u.user_id 
                ORDER BY o.created_at DESC";
        $result = $conn->query($sql);
        $orders = [];
        while($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        echo json_encode($orders);
    }
    exit;
}

// POST: Update Status
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $order_id = $input['order_id'];
    $status = $input['status'];
    
    $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
    $stmt->bind_param("si", $status, $order_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    $stmt->close();
    exit;
}
?>
