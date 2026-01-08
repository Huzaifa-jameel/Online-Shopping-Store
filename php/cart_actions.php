<?php
// php/cart_actions.php
session_start();
header('Content-Type: application/json');
require_once 'db_connection.php';

// Check login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please log in to use the cart']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// VIEW CART (GET)
if ($method === 'GET') {
    $sql = "SELECT c.cart_id, c.product_id, c.quantity, c.color, c.size, 
                   p.name, p.price, p.main_image, p.quantity AS stock
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $cart_items = [];
    $subtotal = 0;
    
    while ($row = $result->fetch_assoc()) {
        $row['total_price'] = $row['price'] * $row['quantity'];
        $subtotal += $row['total_price'];
        $cart_items[] = $row;
    }
    
    echo json_encode(['success' => true, 'items' => $cart_items, 'subtotal' => $subtotal]);
    $stmt->close();
    exit;
}

// OTHER ACTIONS (POST, PUT, DELETE)
// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

if ($method === 'POST') {
    if ($action === 'add') {
        $product_id = $input['product_id'];
        $quantity = $input['quantity'] ?? 1;
        $color = $input['color'] ?? null;
        $size = $input['size'] ?? null;
        
        // Validate stock
        // (Optional: Check actual product stock before adding)
        
        // Check if item already exists in cart with same color/size
        $checkSql = "SELECT cart_id, quantity FROM cart WHERE user_id=? AND product_id=? AND color=? AND size=?";
        // Note: simplified handling for nulls since DB fields are nullable varchars, but usually strictly matching is safer.
        // For this demo, assuming color/size are strings.
        
        $stmt = $conn->prepare("SELECT cart_id, quantity FROM cart WHERE user_id=? AND product_id=? AND (color=? OR color IS NULL) AND (size=? OR size IS NULL)");
        // Actually simplest to just INSERT new row or distinct update.
        // Let's simplified: just INSERT. New entry for every add action unless specific logic requested.
        // User request "update_cart" implies we can change quantity later.
        // Standard e-commerce merges items.
        
        // Let's try to merge if exact match
        $stmt = $conn->prepare("SELECT cart_id, quantity FROM cart WHERE user_id=? AND product_id=? AND color<=>? AND size<=>?");
        $stmt->bind_param("iiss", $user_id, $product_id, $color, $size);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($res->num_rows > 0) {
            // Update existing
            $row = $res->fetch_assoc();
            $new_qty = $row['quantity'] + $quantity;
            $cart_id = $row['cart_id'];
            $updateStmt = $conn->prepare("UPDATE cart SET quantity=? WHERE cart_id=?");
            $updateStmt->bind_param("ii", $new_qty, $cart_id);
            $updateStmt->execute();
            $updateStmt->close();
        } else {
            // Insert new
            $insertStmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity, color, size) VALUES (?, ?, ?, ?, ?)");
            $insertStmt->bind_param("iiiss", $user_id, $product_id, $quantity, $color, $size);
            $insertStmt->execute();
            $insertStmt->close();
        }
        $stmt->close();
        
        echo json_encode(['success' => true, 'message' => 'Item added to cart']);
        exit;
    }
    
    if ($action === 'update') {
        $cart_id = $input['cart_id'];
        $quantity = $input['quantity'];
        
        if ($quantity < 1) {
            echo json_encode(['success' => false, 'message' => 'Quantity must be at least 1']);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE cart SET quantity=? WHERE cart_id=? AND user_id=?");
        $stmt->bind_param("iii", $quantity, $cart_id, $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Update failed']);
        }
        $stmt->close();
        exit;
    }
    
    if ($action === 'delete') {
        $cart_id = $input['cart_id'];
        
        $stmt = $conn->prepare("DELETE FROM cart WHERE cart_id=? AND user_id=?");
        $stmt->bind_param("ii", $cart_id, $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Delete failed']);
        }
        $stmt->close();
        exit;
    }
}

// Fallback
echo json_encode(['success' => false, 'message' => 'Invalid action']);
$conn->close();
?>
