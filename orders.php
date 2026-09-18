<?php

session_start();

header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$password = "";
$database = "maison_restaurant";

$userId = $_SESSION["user_id"] ?? null;

try {

    $pdo = new PDO(
        "mysql:host=$host;charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $pdo->exec("
        CREATE DATABASE IF NOT EXISTS `$database`
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
    ");

    $pdo->exec("USE `$database`");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            zip VARCHAR(20) NOT NULL,
            notes TEXT NULL,
            payment_method VARCHAR(100) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
            delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
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
            product_name VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            quantity INT NOT NULL,
            image VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    ");

    $method = $_SERVER["REQUEST_METHOD"];

    if ($method === "GET") {

        if (!$userId) {

            echo json_encode([
                "success" => true,
                "orders" => []
            ]);

            exit;
        }

        $orderId = isset($_GET["id"]) ? intval($_GET["id"]) : 0;

        if ($orderId > 0) {

            $stmt = $pdo->prepare("
                SELECT *
                FROM orders
                WHERE id = ?
                AND user_id = ?
                LIMIT 1
            ");

            $stmt->execute([
                $orderId,
                $userId
            ]);

            $order = $stmt->fetch();

            if (!$order) {

                echo json_encode([
                    "success" => false,
                    "message" => "Order not found."
                ]);

                exit;
            }

            $stmt = $pdo->prepare("
                SELECT *
                FROM order_items
                WHERE order_id = ?
                ORDER BY id ASC
            ");

            $stmt->execute([$orderId]);

            $items = $stmt->fetchAll();

            echo json_encode([
                "success" => true,
                "order" => $order,
                "items" => $items
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            SELECT *
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
        ");

        $stmt->execute([$userId]);

        $orders = $stmt->fetchAll();

        foreach ($orders as &$order) {

            $stmt = $pdo->prepare("
                SELECT *
                FROM order_items
                WHERE order_id = ?
                ORDER BY id ASC
            ");

            $stmt->execute([$order["id"]]);

            $order["items"] = $stmt->fetchAll();
        }

        echo json_encode([
            "success" => true,
            "orders" => $orders
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

        $orderId = intval($input["id"] ?? 0);
        $status = trim($input["status"] ?? "");

        if ($orderId <= 0 || $status === "") {

            echo json_encode([
                "success" => false,
                "message" => "Invalid order information."
            ]);

            exit;
        }

        $allowedStatuses = [
            "Pending",
            "Preparing",
            "Completed",
            "Cancelled"
        ];

        if (!in_array($status, $allowedStatuses, true)) {

            echo json_encode([
                "success" => false,
                "message" => "Invalid order status."
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE orders
            SET status = ?
            WHERE id = ?
            AND user_id = ?
        ");

        $stmt->execute([
            $status,
            $orderId,
            $userId
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Order status updated."
        ]);

        exit;
    }

    echo json_encode([
        "success" => false,
        "message" => "Invalid request."
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