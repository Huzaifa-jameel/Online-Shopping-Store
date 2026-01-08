<?php
// php/checkout.php
session_start();
header('Content-Type: application/json');
require_once 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please log in to checkout']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Start Transaction
$conn->begin_transaction();

try {
    // 1. Fetch Cart Items
    $sql = "SELECT c.cart_id, c.product_id, c.quantity, c.color, c.size, 
                   p.price, p.product_unique_id, p.quantity AS stock
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ? FOR UPDATE"; // Lock rows
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $cart_items = [];
    $total_price = 0;
    
    while ($row = $result->fetch_assoc()) {
        if ($row['quantity'] > $row['stock']) {
            throw new Exception("Product ID " . $row['product_id'] . " is out of stock (Requested: " . $row['quantity'] . ", Available: " . $row['stock'] . ")");
        }
        $row['line_total'] = $row['price'] * $row['quantity'];
        $total_price += $row['line_total'];
        $cart_items[] = $row;
    }
    $stmt->close();
    
    if (empty($cart_items)) {
        throw new Exception("Cart is empty");
    }
    
    // 2. Create Order
    $stmt = $conn->prepare("INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, 'pending')");
    $stmt->bind_param("id", $user_id, $total_price);
    $stmt->execute();
    $order_id = $conn->insert_id;
    $stmt->close();
    
    // 3. Create Order Items & Update Stock
    $insertItemStmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, product_unique_id, quantity, price, color, size) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $updateStockStmt = $conn->prepare("UPDATE products SET quantity = quantity - ? WHERE product_id = ?");
    
    foreach ($cart_items as $item) {
        // Insert order item
        $insertItemStmt->bind_param("iisiiss", $order_id, $item['product_id'], $item['product_unique_id'], $item['quantity'], $item['price'], $item['color'], $item['size']);
        $insertItemStmt->execute();
        
        // Update stock
        $updateStockStmt->bind_param("ii", $item['quantity'], $item['product_id']);
        $updateStockStmt->execute();
    }
    $insertItemStmt->close();
    $updateStockStmt->close();
    
    // 4. Clear Cart
    $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->close();
    
    // Commit
    $conn->commit();
    
    echo json_encode(['success' => true, 'order_id' => $order_id, 'message' => 'Order placed successfully']);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
