<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

// Start session
session_start();

class AuthAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        
        switch($method) {
            case 'POST':
                if ($action === 'login') {
                    $this->login();
                } elseif ($action === 'register') {
                    $this->register();
                } elseif ($action === 'logout') {
                    $this->logout();
                } else {
                    $this->sendError('Invalid action', 400);
                }
                break;
                
            case 'GET':
                if ($action === 'profile') {
                    $this->getProfile();
                } elseif ($action === 'check') {
                    $this->checkAuth();
                } else {
                    $this->sendError('Invalid action', 400);
                }
                break;
                
            case 'DELETE':
                if ($action === 'logout') {
                    $this->logout();
                } else {
                    $this->sendError('Invalid action', 400);
                }
                break;
                
            default:
                $this->sendError('Method not allowed', 405);
        }
    }
    
    private function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['username']) || !isset($input['password'])) {
            $this->sendError('Username and password are required', 400);
            return;
        }
        
        $username = trim($input['username']);
        $password = $input['password'];
        
        try {
            // Get user from database - first try without STATUS filter
            $query = "SELECT * FROM users WHERE (username = :username OR email = :username)";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("User found: " . ($user ? "Yes" : "No"));
            if ($user) {
                error_log("User status: " . $user['STATUS']);
            }
            
            if ($user && password_verify($password, $user['PASSWORD'])) {
                error_log("Password verified successfully");
                // Create session
                $sessionToken = $this->generateSessionToken();
                $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
                
                // Try to store session in database (skip if table doesn't exist)
                try {
                    $sessionQuery = "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (:user_id, :token, :expires_at)";
                    $sessionStmt = $this->conn->prepare($sessionQuery);
                    $sessionStmt->bindParam(':user_id', $user['id']);
                    $sessionStmt->bindParam(':token', $sessionToken);
                    $sessionStmt->bindParam(':expires_at', $expiresAt);
                    $sessionStmt->execute();
                    error_log("Session stored in database");
                } catch (Exception $sessionError) {
                    error_log("Session storage failed: " . $sessionError->getMessage());
                    // Continue without database session storage
                }
                
                // Set PHP session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['session_token'] = $sessionToken;
                
                // Remove password from response
                unset($user['PASSWORD']);
                
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Đăng nhập thành công',
                    'user' => $user,
                    'session_token' => $sessionToken
                ]);
            } else {
                $this->sendError('Tên đăng nhập hoặc mật khẩu không chính xác', 401);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function register() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $required = ['username', 'email', 'password', 'full_name'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty(trim($input[$field]))) {
                $this->sendError("Trường {$field} là bắt buộc", 400);
                return;
            }
        }
        
        $username = trim($input['username']);
        $email = trim($input['email']);
        $password = $input['password'];
        $fullName = trim($input['full_name']);
        $phone = isset($input['phone']) ? trim($input['phone']) : null;
        $courseId = isset($input['course_id']) ? intval($input['course_id']) : null;
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->sendError('Email không hợp lệ', 400);
            return;
        }
        
        // Validate password strength
        if (strlen($password) < 6) {
            $this->sendError('Mật khẩu phải có ít nhất 6 ký tự', 400);
            return;
        }
        
        try {
            // Check if username or email already exists
            $checkQuery = "SELECT id FROM users WHERE username = :username OR email = :email";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':username', $username);
            $checkStmt->bindParam(':email', $email);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() > 0) {
                $this->sendError('Tên đăng nhập hoặc email đã tồn tại', 409);
                return;
            }
            
            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert new user
            $insertQuery = "INSERT INTO users (username, email, password, full_name, phone, course_id, role, status, enrollment_date) 
                           VALUES (:username, :email, :password, :full_name, :phone, :course_id, 'student', 'active', CURDATE())";
            $insertStmt = $this->conn->prepare($insertQuery);
            $insertStmt->bindParam(':username', $username);
            $insertStmt->bindParam(':email', $email);
            $insertStmt->bindParam(':password', $hashedPassword);
            $insertStmt->bindParam(':full_name', $fullName);
            $insertStmt->bindParam(':phone', $phone);
            $insertStmt->bindParam(':course_id', $courseId);
            
            if ($insertStmt->execute()) {
                $userId = $this->conn->lastInsertId();
                
                // If course selected, create enrollment
                if ($courseId) {
                    $enrollQuery = "INSERT INTO enrollments (student_id, course_id, enrollment_date) VALUES (:student_id, :course_id, CURDATE())";
                    $enrollStmt = $this->conn->prepare($enrollQuery);
                    $enrollStmt->bindParam(':student_id', $userId);
                    $enrollStmt->bindParam(':course_id', $courseId);
                    $enrollStmt->execute();
                }
                
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.',
                    'user_id' => $userId
                ]);
            } else {
                $this->sendError('Không thể tạo tài khoản', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function logout() {
        try {
            // Remove session from database if exists
            if (isset($_SESSION['session_token'])) {
                $deleteQuery = "DELETE FROM user_sessions WHERE session_token = :token";
                $deleteStmt = $this->conn->prepare($deleteQuery);
                $deleteStmt->bindParam(':token', $_SESSION['session_token']);
                $deleteStmt->execute();
            }
            
            // Clear all session variables
            $_SESSION = array();
            
            // Delete session cookie if it exists
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            
            // Destroy PHP session
            session_destroy();
            
            $this->sendResponse([
                'success' => true,
                'message' => 'Đăng xuất thành công'
            ]);
        } catch (Exception $e) {
            $this->sendError('Lỗi khi đăng xuất: ' . $e->getMessage(), 500);
        }
    }
    
    private function getProfile() {
        if (!$this->isLoggedIn()) {
            $this->sendError('Chưa đăng nhập', 401);
            return;
        }
        
        try {
            $query = "SELECT u.*, c.name as course_name FROM users u 
                     LEFT JOIN courses c ON u.course_id = c.id 
                     WHERE u.id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $_SESSION['user_id']);
            $stmt->execute();
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                unset($user['PASSWORD']);
                $this->sendResponse([
                    'success' => true,
                    'user' => $user
                ]);
            } else {
                $this->sendError('Không tìm thấy thông tin người dùng', 404);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function checkAuth() {
        $this->sendResponse([
            'authenticated' => $this->isLoggedIn(),
            'user' => $this->isLoggedIn() ? [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'role' => $_SESSION['role']
            ] : null
        ]);
    }
    
    private function isLoggedIn() {
        return isset($_SESSION['user_id']) && isset($_SESSION['session_token']);
    }
    
    private function generateSessionToken() {
        return bin2hex(random_bytes(32));
    }
    
    private function sendResponse($data) {
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Handle the request
$auth = new AuthAPI();
$auth->handleRequest();
?>