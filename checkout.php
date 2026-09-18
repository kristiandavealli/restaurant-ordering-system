<?php

session_start();

header("Content-Type: application/json");

$host = "localhost";
$username = "root";
$password = "";
$database = "maison_restaurant";

$userId = $_SESSION["user_id"] ?? null;

try {

    $pdo = new PDO(
        "mysql:host=$host;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    $pdo->exec("USE `$database`");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL,
            phone VARCHAR(30) NOT NULL,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            zip VARCHAR(20) NOT NULL,
            notes TEXT NULL,
            payment_method VARCHAR(50) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
            delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 50,
            discount DECIMAL(10,2) NOT NULL DEFAULT 0,
            total DECIMAL(10,2) NOT NULL DEFAULT 0,
            status VARCHAR(50) NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            product_name VARCHAR(150) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            image VARCHAR(255) NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    ");

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {

        echo json_encode([
            "success" => true,
            "message" => "Checkout API is working."
        ]);

        exit;
    }

    if (!$userId) {

        echo json_encode([
            "success" => false,
            "message" => "Please login first."
        ]);

        exit;
    }

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        $input = $_POST;
    }

    $firstName = trim($input["first_name"] ?? "");
    $lastName = trim($input["last_name"] ?? "");
    $email = trim($input["email"] ?? "");
    $phone = trim($input["phone"] ?? "");
    $address = trim($input["address"] ?? "");
    $city = trim($input["city"] ?? "");
    $zip = trim($input["zip"] ?? "");
    $notes = trim($input["notes"] ?? "");
    $paymentMethod = trim($input["payment_method"] ?? "Cash on Delivery");

    if (
        $firstName === "" ||
        $lastName === "" ||
        $email === "" ||
        $phone === "" ||
        $address === "" ||
        $city === "" ||
        $zip === ""
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Please complete all required customer and delivery information."
        ]);

        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        echo json_encode([
            "success" => false,
            "message" => "Please enter a valid email address."
        ]);

        exit;
    }

    $allowedPayments = [
        "Cash on Delivery",
        "GCash",
        "Credit / Debit Card"
    ];

    if (!in_array($paymentMethod, $allowedPayments, true)) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid payment method."
        ]);

        exit;
    }

    $cartStatement = $pdo->prepare("
        SELECT
            id,
            product_id,
            product_name,
            price,
            quantity,
            image
        FROM cart
        WHERE user_id = ?
        ORDER BY id ASC
    ");

    $cartStatement->execute([$userId]);

    $cartItems = $cartStatement->fetchAll();

    if (count($cartItems) === 0) {

        echo json_encode([
            "success" => false,
            "message" => "Your cart is empty."
        ]);

        exit;
    }

    $subtotal = 0;

    foreach ($cartItems as $item) {
        $subtotal += (float)$item["price"] * (int)$item["quantity"];
    }

    $deliveryFee = 50;

    $discount = 0;

    if (isset($input["discount"])) {
        $discount = max(0, (float)$input["discount"]);
    }

    if ($discount > $subtotal) {
        $discount = $subtotal;
    }

    $total = $subtotal + $deliveryFee - $discount;

    $pdo->beginTransaction();

    $orderStatement = $pdo->prepare("
        INSERT INTO orders
        (
            user_id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            zip,
            notes,
            payment_method,
            subtotal,
            delivery_fee,
            discount,
            total,
            status
        )
        VALUES
        (
            :user_id,
            :first_name,
            :last_name,
            :email,
            :phone,
            :address,
            :city,
            :zip,
            :notes,
            :payment_method,
            :subtotal,
            :delivery_fee,
            :discount,
            :total,
            'Pending'
        )
    ");

    $orderStatement->execute([
        ":user_id" => $userId,
        ":first_name" => $firstName,
        ":last_name" => $lastName,
        ":email" => $email,
        ":phone" => $phone,
        ":address" => $address,
        ":city" => $city,
        ":zip" => $zip,
        ":notes" => $notes,
        ":payment_method" => $paymentMethod,
        ":subtotal" => $subtotal,
        ":delivery_fee" => $deliveryFee,
        ":discount" => $discount,
        ":total" => $total
    ]);

    $orderId = $pdo->lastInsertId();

    $itemStatement = $pdo->prepare("
        INSERT INTO order_items
        (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            image
        )
        VALUES
        (
            :order_id,
            :product_id,
            :product_name,
            :price,
            :quantity,
            :image
        )
    ");

    foreach ($cartItems as $item) {

        $itemStatement->execute([
            ":order_id" => $orderId,
            ":product_id" => $item["product_id"],
            ":product_name" => $item["product_name"],
            ":price" => $item["price"],
            ":quantity" => $item["quantity"],
            ":image" => $item["image"]
        ]);
    }

    $deleteCart = $pdo->prepare("
        DELETE FROM cart
        WHERE user_id = ?
    ");

    $deleteCart->execute([$userId]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Order placed successfully.",
        "order_id" => $orderId,
        "subtotal" => $subtotal,
        "delivery_fee" => $deliveryFee,
        "discount" => $discount,
        "total" => $total
    ]);

} catch (PDOException $e) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>