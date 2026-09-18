<?php

header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "maison_restaurant";

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

    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

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
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullname VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
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

    $fullname = trim($input["fullname"] ?? "");
    $email = trim($input["email"] ?? "");
    $password = $input["password"] ?? "";
    $confirmPassword = $input["confirmPassword"] ?? "";

    if ($fullname === "" || $email === "" || $password === "" || $confirmPassword === "") {
        echo json_encode([
            "success" => false,
            "message" => "Please complete all fields."
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

    if ($password !== $confirmPassword) {
        echo json_encode([
            "success" => false,
            "message" => "Passwords do not match."
        ]);
        exit;
    }

    if (strlen($password) < 6) {
        echo json_encode([
            "success" => false,
            "message" => "Password must be at least 6 characters."
        ]);
        exit;
    }

    $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);

    if ($check->fetch()) {
        echo json_encode([
            "success" => false,
            "message" => "Email address is already registered."
        ]);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO users (fullname, email, password)
        VALUES (?, ?, ?)
    ");

    $stmt->execute([
        $fullname,
        $email,
        $hashedPassword
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Account created successfully."
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>