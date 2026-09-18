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

    $products = [

        [
            "id" => 101,
            "name" => "Classic Beef Burger",
            "price" => 180,
            "description" => "Juicy beef patty, fresh lettuce, tomato, and special sauce.",
            "image" => "food-one",
            "category" => "Burgers"
        ],

        [
            "id" => 102,
            "name" => "Truffle Mushroom Pasta",
            "price" => 150,
            "description" => "Creamy pasta with mushrooms and a touch of truffle oil.",
            "image" => "food-two",
            "category" => "Pasta"
        ],

        [
            "id" => 103,
            "name" => "Signature Chicken",
            "price" => 229,
            "description" => "Crispy golden chicken served with our signature dipping sauce.",
            "image" => "food-three",
            "category" => "Chicken"
        ]

    ];

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        echo json_encode([
            "success" => true,
            "message" => "Maison homepage API is working.",
            "products" => $products
        ]);

        exit;
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

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

        $productId = (int)($input["product_id"] ?? 0);
        $quantity = (int)($input["quantity"] ?? 1);

        if ($quantity < 1) {
            $quantity = 1;
        }

        $selectedProduct = null;

        foreach ($products as $product) {

            if ($product["id"] === $productId) {

                $selectedProduct = $product;

                break;
            }
        }

        if (!$selectedProduct) {

            echo json_encode([
                "success" => false,
                "message" => "Product not found."
            ]);

            exit;
        }

        $check = $pdo->prepare("
            SELECT id, quantity
            FROM cart
            WHERE user_id = :user_id
            AND product_id = :product_id
            LIMIT 1
        ");

        $check->execute([
            ":user_id" => $userId,
            ":product_id" => $productId
        ]);

        $existingItem = $check->fetch();

        if ($existingItem) {

            $newQuantity = (int)$existingItem["quantity"] + $quantity;

            $update = $pdo->prepare("
                UPDATE cart
                SET quantity = :quantity
                WHERE id = :id
                AND user_id = :user_id
            ");

            $update->execute([
                ":quantity" => $newQuantity,
                ":id" => $existingItem["id"],
                ":user_id" => $userId
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
                VALUES
                (
                    :user_id,
                    :product_id,
                    :product_name,
                    :price,
                    :quantity,
                    :image
                )
            ");

            $insert->execute([
                ":user_id" => $userId,
                ":product_id" => $selectedProduct["id"],
                ":product_name" => $selectedProduct["name"],
                ":price" => $selectedProduct["price"],
                ":quantity" => $quantity,
                ":image" => $selectedProduct["image"]
            ]);
        }

        $countStatement = $pdo->prepare("
            SELECT COALESCE(SUM(quantity), 0) AS cart_count
            FROM cart
            WHERE user_id = ?
        ");

        $countStatement->execute([$userId]);

        $cartCount = (int)$countStatement->fetch()["cart_count"];

        echo json_encode([
            "success" => true,
            "message" => $selectedProduct["name"] . " added to cart.",
            "product" => $selectedProduct,
            "cart_count" => $cartCount
        ]);

        exit;
    }

    echo json_encode([
        "success" => false,
        "message" => "Unsupported request method."
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}

?>