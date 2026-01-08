<?php
// php/admin/products.php
header('Content-Type: application/json');
require_once '../db_connection.php';
session_start();

if (!isset($_SESSION['role']) || ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'super_admin')) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: List Products ---
if ($method === 'GET') {
    $sql = "SELECT p.*, b.brand_name as brand, c.category_name as category 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            ORDER BY p.created_at DESC";
    $result = $conn->query($sql);
    
    $products = [];
    while($row = $result->fetch_assoc()) {
        $row['colors'] = json_decode($row['colors']);
        $row['sizes'] = json_decode($row['sizes']);
        $products[] = $row;
    }
    echo json_encode($products);
    exit;
}

// --- POST: Add or Update Product ---
if ($method === 'POST') {
    // Check if it's a delete request disguised as POST (sometimes convenient)
    // But we should use proper REST or a 'action' param.
    // Let's check for 'action' field in POST 
    $action = $_POST['action'] ?? 'save';
    
    if ($action === 'delete') {
        $id = $_POST['product_id'];
        $stmt = $conn->prepare("DELETE FROM products WHERE product_id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
             echo json_encode(['success' => false, 'message' => $conn->error]);
        }
        $stmt->close();
        exit;
    }

    // --- SAVE (Add/Edit) ---
    // Handle File Upload
    $main_image_url = $_POST['existing_image'] ?? ''; // hidden input for edit
    
    if (isset($_FILES['main_image']) && $_FILES['main_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../images/uploads/'; // Path relative to this php file
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileName = time() . '_' . basename($_FILES['main_image']['name']);
        $targetFile = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['main_image']['tmp_name'], $targetFile)) {
            $main_image_url = 'images/uploads/' . $fileName; // Path to store in DB
        }
    }

    // Get Fields
    $product_id = $_POST['product_id'] ?? ''; // Empty if new
    $name = $_POST['name'];
    $brand_name = $_POST['brand']; // We get name, need ID
    $category_name = $_POST['category']; // We get name, need ID
    $price = $_POST['price'];
    $quantity = $_POST['quantity'];
    $description = $_POST['description'];
    $colors = json_encode(array_map('trim', explode(',', $_POST['colors'])));
    // Sizes comes as array from checkboxes
    $sizes_arr = $_POST['sizes'] ?? []; // array of values
    $sizes = json_encode($sizes_arr);
    
    $is_feature = isset($_POST['is_feature']) ? 1 : 0;
    $is_sale = isset($_POST['is_sale']) ? 1 : 0;

    // Resolve Brand ID
    $brand_id = null;
    $res = $conn->query("SELECT brand_id FROM brands WHERE brand_name = '$brand_name'");
    if ($res->num_rows > 0) $brand_id = $res->fetch_assoc()['brand_id'];
    
    // Resolve Category ID & Prefix
    $category_id = null;
    $cat_prefix = 9000;
    $res = $conn->query("SELECT category_id, category_prefix FROM categories WHERE category_name = '$category_name'");
    if ($res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $category_id = $row['category_id'];
        $cat_prefix = $row['category_prefix'];
    }

    if ($product_id) {
        // UPDATE
        $sql = "UPDATE products SET name=?, brand_id=?, category_id=?, price=?, quantity=?, 
                description=?, colors=?, sizes=?, main_image=?, is_feature=?, is_sale=? 
                WHERE product_id=?";
        $stmt = $conn->prepare($sql);
        // FIXED: Changed 'S' to 's' for strings
        $stmt->bind_param("siidissssiii", $name, $brand_id, $category_id, $price, $quantity, 
                          $description, $colors, $sizes, $main_image_url, $is_feature, $is_sale, $product_id);
    } else {
        // INSERT
        // Generate Unique ID: Prefix + Random 3/4 digits
        // Check uniqueness loop? For simplicity: just timestamp wrapper or random.
        $unique_id = $cat_prefix . rand(100, 999);
        
        $sql = "INSERT INTO products (product_unique_id, name, brand_id, category_id, price, quantity, 
                description, colors, sizes, main_image, is_feature, is_sale) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        // FIXED: Changed 'S' to 's' for strings
        $stmt->bind_param("ssiidissssii", $unique_id, $name, $brand_id, $category_id, $price, $quantity, 
                          $description, $colors, $sizes, $main_image_url, $is_feature, $is_sale);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    $stmt->close();
    exit;
}

$conn->close();
?>
