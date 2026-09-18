<?php

session_start();

header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$password = "";
$database = "maison_restaurant";

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

    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    $pdo->exec("USE `$database`");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullname VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {

        echo json_encode([
            "success" => false,
            "message" => "Invalid request method."
        ]);

        exit;
    }

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        $input = $_POST;
    }

    $email = trim($input["email"] ?? "");
    $userPassword = $input["password"] ?? "";

    if ($email === "" || $userPassword === "") {

        echo json_encode([
            "success" => false,
            "message" => "Please enter your email and password."
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

    $stmt = $pdo->prepare("
        SELECT id, fullname, email, password
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([$email]);

    $account = $stmt->fetch();

    if (!$account || !password_verify($userPassword, $account["password"])) {

        echo json_encode([
            "success" => false,
            "message" => "Incorrect email or password."
        ]);

        exit;
    }

    $_SESSION["user_id"] = $account["id"];
    $_SESSION["fullname"] = $account["fullname"];
    $_SESSION["email"] = $account["email"];

    echo json_encode([
        "success" => true,
        "message" => "Login successful.",
        "user" => [
            "id" => $account["id"],
            "fullname" => $account["fullname"],
            "email" => $account["email"]
        ]
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