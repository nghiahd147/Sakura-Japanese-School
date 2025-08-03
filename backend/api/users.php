<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

// Start session
session_start();

class UsersAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function handleRequest() {
        // Check if user is authenticated
        if (!$this->isAuthenticated()) {
            $this->sendError('Chưa đăng nhập', 401);
            return;
        }
        
        $method = $_SERVER['REQUEST_METHOD'];
        $userId = isset($_GET['id']) ? intval($_GET['id']) : null;
        
        switch($method) {
            case 'GET':
                if ($userId) {
                    // Allow admin to get any user, or user to get their own profile
                    if ($this->isAdmin() || $this->isOwnProfile($userId)) {
                        $this->getUser($userId);
                    } else {
                        $this->sendError('Không có quyền truy cập', 403);
                    }
                } else {
                    // Only admin can get all users
                    if ($this->isAdmin()) {
                        $this->getAllUsers();
                    } else {
                        $this->sendError('Không có quyền truy cập', 403);
                    }
                }
                break;
                
            case 'POST':
                // Only admin can create users
                if ($this->isAdmin()) {
                    $this->createUser();
                } else {
                    $this->sendError('Không có quyền truy cập', 403);
                }
                break;
                
            case 'PUT':
                if ($userId) {
                    // Allow admin to update any user, or user to update their own profile
                    if ($this->isAdmin() || $this->isOwnProfile($userId)) {
                        $this->updateUser($userId);
                    } else {
                        $this->sendError('Không có quyền truy cập', 403);
                    }
                } else {
                    $this->sendError('ID người dùng là bắt buộc', 400);
                }
                break;
                
            case 'DELETE':
                if ($userId) {
                    $this->deleteUser($userId);
                } else {
                    $this->sendError('ID người dùng là bắt buộc', 400);
                }
                break;
                
            default:
                $this->sendError('Method not allowed', 405);
        }
    }
    
    private function getAllUsers() {
        try {
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 10;
            $offset = ($page - 1) * $limit;
            
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            $role = isset($_GET['role']) ? trim($_GET['role']) : '';
            $status = isset($_GET['status']) ? trim($_GET['status']) : ''; // Thêm filter status
            
            // Build WHERE clause
            $whereConditions = [];
            $params = [];
            
            if (!empty($search)) {
                $whereConditions[] = "(u.username LIKE :search OR u.email LIKE :search OR u.full_name LIKE :search)";
                $params[':search'] = "%{$search}%";
            }
            
            if (!empty($role)) {
                $whereConditions[] = "u.role = :role";
                $params[':role'] = $role;
            }
            
            // Thêm filter status
            if (!empty($status)) {
                $whereConditions[] = "u.status = :status";
                $params[':status'] = $status;
            }
            
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
            
            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM users u {$whereClause}";
            $countStmt = $this->conn->prepare($countQuery);
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value);
            }
            $countStmt->execute();
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get users with pagination - explicitly select fields to ensure consistent naming
            $query = "SELECT u.id, u.username, u.email, u.password, u.full_name, u.phone, 
                            u.role, u.status, u.enrollment_date, u.course_id, 
                            u.created_at, u.updated_at, c.name as course_name 
                     FROM users u 
                     LEFT JOIN courses c ON u.course_id = c.id 
                     {$whereClause}
                     ORDER BY u.created_at DESC 
                     LIMIT :offset, :limit";
            
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Remove passwords from response
            foreach ($users as &$user) {
                unset($user['password']);
            }
            
            $this->sendResponse([
                'success' => true,
                'data' => $users,
                'pagination' => [
                    'total' => intval($total),
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function getUser($userId) {
        try {
            // Explicitly select fields to ensure consistent naming
            $query = "SELECT u.id, u.username, u.email, u.password, u.full_name, u.phone, 
                            u.role, u.status, u.enrollment_date, u.course_id, 
                            u.created_at, u.updated_at, c.name as course_name 
                     FROM users u 
                     LEFT JOIN courses c ON u.course_id = c.id 
                     WHERE u.id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $userId);
            $stmt->execute();
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                // Remove password for security but keep track that user has password
                unset($user['password']);
                $user['has_password'] = true;
                

                
                $this->sendResponse([
                    'success' => true,
                    'data' => $user
                ]);
            } else {
                $this->sendError('Không tìm thấy người dùng', 404);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function createUser() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $required = ['username', 'email', 'password', 'full_name', 'role'];
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
        $role = trim($input['role']);
        $status = isset($input['status']) ? trim($input['status']) : 'active';
        $courseId = isset($input['course_id']) ? intval($input['course_id']) : null;
        
        // Validate inputs
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->sendError('Email không hợp lệ', 400);
            return;
        }
        
        if (!in_array($role, ['admin', 'teacher', 'student'])) {
            $this->sendError('Vai trò không hợp lệ', 400);
            return;
        }
        
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
            $insertQuery = "INSERT INTO users (username, email, password, full_name, phone, role, status, course_id, enrollment_date) 
                           VALUES (:username, :email, :password, :full_name, :phone, :role, :status, :course_id, :enrollment_date)";
            $insertStmt = $this->conn->prepare($insertQuery);
            $insertStmt->bindParam(':username', $username);
            $insertStmt->bindParam(':email', $email);
            $insertStmt->bindParam(':password', $hashedPassword);
            $insertStmt->bindParam(':full_name', $fullName);
            $insertStmt->bindParam(':phone', $phone);
            $insertStmt->bindParam(':role', $role);
            $insertStmt->bindParam(':status', $status);
            $insertStmt->bindParam(':course_id', $courseId);
            
            $enrollmentDate = ($role === 'student') ? date('Y-m-d') : null;
            $insertStmt->bindParam(':enrollment_date', $enrollmentDate);
            
            if ($insertStmt->execute()) {
                $userId = $this->conn->lastInsertId();
                
                // If student and course selected, create enrollment
                if ($role === 'student' && $courseId) {
                    $enrollQuery = "INSERT INTO enrollments (student_id, course_id, enrollment_date) VALUES (:student_id, :course_id, CURDATE())";
                    $enrollStmt = $this->conn->prepare($enrollQuery);
                    $enrollStmt->bindParam(':student_id', $userId);
                    $enrollStmt->bindParam(':course_id', $courseId);
                    $enrollStmt->execute();
                }
                
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Tạo người dùng thành công',
                    'user_id' => $userId
                ]);
            } else {
                $this->sendError('Không thể tạo người dùng', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function updateUser($userId) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            // Get current user data
            $getCurrentQuery = "SELECT * FROM users WHERE id = :id";
            $getCurrentStmt = $this->conn->prepare($getCurrentQuery);
            $getCurrentStmt->bindParam(':id', $userId);
            $getCurrentStmt->execute();
            $currentUser = $getCurrentStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$currentUser) {
                $this->sendError('Không tìm thấy người dùng', 404);
                return;
            }
            
            // Build update query dynamically
            $updateFields = [];
            $params = [':id' => $userId];
            
            // Different allowed fields for admin vs regular users
            if ($this->isAdmin()) {
                $allowedFields = ['username', 'email', 'full_name', 'phone', 'role', 'status', 'course_id'];
            } else {
                // Regular users can only update their own basic info
                $allowedFields = ['full_name', 'phone'];
            }
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if ($field === 'email' && !filter_var($input[$field], FILTER_VALIDATE_EMAIL)) {
                        $this->sendError('Email không hợp lệ', 400);
                        return;
                    }
                    
                    if ($field === 'role' && !in_array($input[$field], ['admin', 'teacher', 'student'])) {
                        $this->sendError('Vai trò không hợp lệ', 400);
                        return;
                    }
                    
                    $updateFields[] = "{$field} = :{$field}";
                    $params[":{$field}"] = $input[$field];
                }
            }
            
            // Handle password update
            if (isset($input['password']) && !empty($input['password'])) {
                if (strlen($input['password']) < 6) {
                    $this->sendError('Mật khẩu phải có ít nhất 6 ký tự', 400);
                    return;
                }
                $updateFields[] = "password = :password";
                $params[':password'] = password_hash($input['password'], PASSWORD_DEFAULT);
            }
            
            if (empty($updateFields)) {
                $this->sendError('Không có dữ liệu để cập nhật', 400);
                return;
            }
            
            $updateQuery = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            
            foreach ($params as $key => $value) {
                $updateStmt->bindValue($key, $value);
            }
            
            if ($updateStmt->execute()) {
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Cập nhật người dùng thành công'
                ]);
            } else {
                $this->sendError('Không thể cập nhật người dùng', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function deleteUser($userId) {
        try {
            // Check if user exists
            $checkQuery = "SELECT id FROM users WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $userId);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() === 0) {
                $this->sendError('Không tìm thấy người dùng', 404);
                return;
            }
            
            // Don't allow deleting yourself
            if ($userId == $_SESSION['user_id']) {
                $this->sendError('Không thể xóa tài khoản của chính mình', 400);
                return;
            }
            
            // Delete user (foreign key constraints will handle related records)
            $deleteQuery = "DELETE FROM users WHERE id = :id";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            $deleteStmt->bindParam(':id', $userId);
            
            if ($deleteStmt->execute()) {
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Xóa người dùng thành công'
                ]);
            } else {
                $this->sendError('Không thể xóa người dùng', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function isAuthenticated() {
        return isset($_SESSION['user_id']) && isset($_SESSION['role']);
    }
    
    private function isAdmin() {
        return $this->isAuthenticated() && $_SESSION['role'] === 'admin';
    }
    
    private function isOwnProfile($userId) {
        return $this->isAuthenticated() && $_SESSION['user_id'] == $userId;
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
$users = new UsersAPI();
$users->handleRequest();
?>