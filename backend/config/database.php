<?php
// Database configuration
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;

    public function __construct() {
        // Check for Heroku ClearDB URL first
        if (isset($_ENV['CLEARDB_DATABASE_URL'])) {
            $url = parse_url($_ENV['CLEARDB_DATABASE_URL']);
            $this->host = $url['host'];
            $this->db_name = substr($url['path'], 1);
            $this->username = $url['user'];
            $this->password = $url['pass'];
        } else {
            // Fallback to individual environment variables
            $this->host = $_ENV['MYSQLHOST'] ?? 'localhost';
            $this->db_name = $_ENV['MYSQLDATABASE'] ?? 'japanese_school';
            $this->username = $_ENV['MYSQLUSER'] ?? 'root';
            $this->password = $_ENV['MYSQLPASSWORD'] ?? '';
        }
    }
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?> 