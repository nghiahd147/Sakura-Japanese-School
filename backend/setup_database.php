<?php
// Database setup script
$host = "localhost";
$username = "root";
$password = "";
$db_name = "japanese_school";

try {
    // Connect to MySQL server (without database)
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database '$db_name' created or already exists.\n";
    
    // Connect to the database
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create courses table
    $sql = "CREATE TABLE IF NOT EXISTS `courses` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `level` varchar(50) NOT NULL,
        `description` text,
        `duration_weeks` int(11) NOT NULL,
        `total_hours` int(11) NOT NULL,
        `price` decimal(10,2) NOT NULL,
        `features` text,
        `level_order` int(11) DEFAULT 1,
        `status` enum('active','inactive') DEFAULT 'active',
        `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "Table 'courses' created or already exists.\n";
    
    // Create enrollments table for student count
    $sql = "CREATE TABLE IF NOT EXISTS `enrollments` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `course_id` int(11) NOT NULL,
        `user_id` int(11) NOT NULL,
        `status` enum('active','inactive','completed') DEFAULT 'active',
        `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `course_id` (`course_id`),
        KEY `user_id` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "Table 'enrollments' created or already exists.\n";
    
    // Create users table if not exists
    $sql = "CREATE TABLE IF NOT EXISTS `users` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `username` varchar(100) NOT NULL,
        `email` varchar(255) NOT NULL,
        `password` varchar(255) NOT NULL,
        `full_name` varchar(255),
        `role` enum('student','teacher','admin') DEFAULT 'student',
        `status` enum('active','inactive') DEFAULT 'active',
        `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `username` (`username`),
        UNIQUE KEY `email` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "Table 'users' created or already exists.\n";
    
    // Insert sample data if tables are empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM courses");
    if ($stmt->fetchColumn() == 0) {
        $sql = "INSERT INTO courses (name, level, description, duration_weeks, total_hours, price, level_order) VALUES
            ('Khóa học cơ bản N5', 'N5', 'Dành cho người mới bắt đầu học tiếng Nhật', 24, 72, 5000000, 1),
            ('Khóa học trung cấp N4-N3', 'N4-N3', 'Nâng cao kỹ năng tiếng Nhật', 32, 96, 7000000, 2),
            ('Khóa học cao cấp N2-N1', 'N2-N1', 'Chuẩn bị cho đại học Nhật Bản', 48, 144, 10000000, 4)";
        $pdo->exec($sql);
        echo "Sample courses inserted.\n";
    }
    
    echo "Database setup completed successfully!\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>