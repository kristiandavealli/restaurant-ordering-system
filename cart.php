<?php

session_start();

header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "maison_restaurant";

$userId = $_SESSION["user_id"] ?? null;

try {

    $pdo = new PDO(
        "mysql:host=$host;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $pdo->exec("
        CREATE DATABASE IF NOT EXISTS `$dbname`
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
    ");

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS cart (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            product_id INT NOT NULL,
            product_name VARCHAR(150) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            image VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $method = $_SERVER["REQUEST_METHOD"];

    if ($method === "GET") {

        if (!$userId) {

            echo json_encode([
                "success" => true,
                "items" => [],
                "subtotal" => 0,
                "delivery_fee" => 0,
                "discount" => 0,
                "total" => 0
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            SELECT
                id,
                product_id,
                product_name,
                price,
                quantity,
                image
            FROM cart
            WHERE user_id = ?
            ORDER BY id DESC
        ");

        $stmt->execute([$userId]);

        $items = $stmt->fetchAll();

        $subtotal = 0;

        foreach ($items as $item) {
            $subtotal += Number($item["price"]) * Number($item["quantity"]);
        }

        $deliveryFee = count($items) > 0 ? 50 : 0;

        $discount = 0;

        $total = $subtotal + $deliveryFee - $discount;

        echo json_encode([
            "success" => true,
            "items" => $items,
            "subtotal" => $subtotal,
            "delivery_fee" => $deliveryFee,
            "discount" => $discount,
            "total" => $total
        ]);

        exit;
    }

    if ($method === "POST") {

        if (!$userId) {

            echo json_encode([
                "success" => false,
                "message" => "Please login first."
            ]);

            exit;
        }

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!$input) {
            $input = $_POST;
        }

        $productId = intval($input["product_id"] ?? 0);
        $productName = trim($input["product_name"] ?? "");
        $price = floatval($input["price"] ?? 0);
        $quantity = intval($input["quantity"] ?? 1);
        $image = trim($input["image"] ?? "");

        if ($productId <= 0 || $productName === "" || $price <= 0) {

            echo json_encode([
                "success" => false,
                "message" => "Invalid product information."
            ]);

            exit;
        }

        if ($quantity < 1) {
            $quantity = 1;
        }

        $check = $pdo->prepare("
            SELECT id, quantity
            FROM cart
            WHERE user_id = ?
            AND product_id = ?
            LIMIT 1
        ");

        $check->execute([
            $userId,
            $productId
        ]);

        $existing = $check->fetch();

        if ($existing) {

            $newQuantity =
                intval($existing["quantity"]) + $quantity;

            $update = $pdo->prepare("
                UPDATE cart
                SET quantity = ?
                WHERE id = ?
                AND user_id = ?
            ");

            $update->execute([
                $newQuantity,
                $existing["id"],
                $userId
            ]);

        } else {

            $insert = $pdo->prepare("
                INSERT INTO cart
                (
                    user_id,
                    product_id,
                    product_name,
                    price,
                    quantity,
                    image
                )
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            $insert->execute([
                $userId,
                $productId,
                $productName,
                $price,
                $quantity,
                $image
            ]);
        }

        $countStmt = $pdo->prepare("
            SELECT COALESCE(SUM(quantity), 0)
            FROM cart
            WHERE user_id = ?
        ");

        $countStmt->execute([$userId]);

        $cartCount = intval($countStmt->fetchColumn());

        echo json_encode([
            "success" => true,
            "message" => "Item added to cart.",
            "cart_count" => $cartCount
        ]);

        exit;
    }

    if ($method === "PUT") {

        if (!$userId) {

            echo json_encode([
                "success" => false,
                "message" => "Please login first."
            ]);

            exit;
        }

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        $cartId = intval($input["id"] ?? 0);
        $quantity = intval($input["quantity"] ?? 1);

        if ($cartId <= 0 || $quantity < 1) {

            echo json_encode([
                "success" => false,
                "message" => "Invalid cart information."
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE cart
            SET quantity = ?
            WHERE id = ?
            AND user_id = ?
        ");

        $stmt->execute([
            $quantity,
            $cartId,
            $userId
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Cart updated."
        ]);

        exit;
    }

    if ($method === "DELETE") {

        if (!$userId) {

            echo json_encode([
                "success" => false,
                "message" => "Please login first."
            ]);

            exit;
        }

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        $cartId = intval($input["id"] ?? 0);

        if ($cartId <= 0) {

            echo json_encode([
                "success" => false,
                "message" => "Invalid cart item."
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            DELETE FROM cart
            WHERE id = ?
            AND user_id = ?
        ");

        $stmt->execute([
            $cartId,
            $userId
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Item removed from cart."
        ]);

        exit;
    }

    echo json_encode([
        "success" => false,
        "message" => "Unsupported request method."
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error.",
        "error" => $e->getMessage()
    ]);
}
?>