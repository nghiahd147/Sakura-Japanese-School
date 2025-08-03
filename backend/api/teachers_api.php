<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

// Start session
session_start();

class TeachersAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $teacherId = isset($_GET['id']) ? intval($_GET['id']) : null;
        
        switch($method) {
            case 'GET':
                if ($teacherId) {
                    $this->getTeacher($teacherId);
                } else {
                    $this->getAllTeachers();
                }
                break;
                
            case 'POST':
                if (!$this->isAdmin()) {
                    $this->sendError('Không có quyền truy cập', 403);
                    return;
                }
                $this->createTeacher();
                break;
                
            case 'PUT':
                if (!$this->isAdmin()) {
                    $this->sendError('Không có quyền truy cập', 403);
                    return;
                }
                if ($teacherId) {
                    $this->updateTeacher($teacherId);
                } else {
                    $this->sendError('ID giảng viên là bắt buộc', 400);
                }
                break;
                
            case 'DELETE':
                if (!$this->isAdmin()) {
                    $this->sendError('Không có quyền truy cập', 403);
                    return;
                }
                if ($teacherId) {
                    $this->deleteTeacher($teacherId);
                } else {
                    $this->sendError('ID giảng viên là bắt buộc', 400);
                }
                break;
                
            default:
                $this->sendError('Method not allowed', 405);
        }
    }
    
    private function getAllTeachers() {
        try {
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 10;
            $offset = ($page - 1) * $limit;
            
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            
            // Build WHERE clause
            $whereConditions = [];
            $params = [];
            
            if (!empty($search)) {
                $whereConditions[] = "(name LIKE :search OR position LIKE :search OR description LIKE :search)";
                $params[':search'] = "%{$search}%";
            }
            
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
            
            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM teachers {$whereClause}";
            $countStmt = $this->conn->prepare($countQuery);
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value);
            }
            $countStmt->execute();
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get teachers
            $query = "SELECT * FROM teachers 
                     {$whereClause}
                     ORDER BY created_at DESC 
                     LIMIT :offset, :limit";
            
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->sendResponse([
                'success' => true,
                'data' => $teachers,
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
    
    private function getTeacher($teacherId) {
        try {
            $query = "SELECT * FROM teachers WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $teacherId);
            $stmt->execute();
            
            $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($teacher) {
                $this->sendResponse([
                    'success' => true,
                    'data' => $teacher
                ]);
            } else {
                $this->sendError('Không tìm thấy giảng viên', 404);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function createTeacher() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $required = ['name', 'position'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty(trim($input[$field]))) {
                $this->sendError("Trường {$field} là bắt buộc", 400);
                return;
            }
        }
        
        $name = trim($input['name']);
        $position = trim($input['position']);
        $description = isset($input['description']) ? trim($input['description']) : '';
        $imageUrl = isset($input['image_url']) ? trim($input['image_url']) : '';
        
        try {
            $insertQuery = "INSERT INTO teachers (name, position, description, image_url) 
                           VALUES (:name, :position, :description, :image_url)";
            $insertStmt = $this->conn->prepare($insertQuery);
            $insertStmt->bindParam(':name', $name);
            $insertStmt->bindParam(':position', $position);
            $insertStmt->bindParam(':description', $description);
            $insertStmt->bindParam(':image_url', $imageUrl);
            
            if ($insertStmt->execute()) {
                $teacherId = $this->conn->lastInsertId();
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Tạo giảng viên thành công',
                    'teacher_id' => $teacherId
                ]);
            } else {
                $this->sendError('Không thể tạo giảng viên', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function updateTeacher($teacherId) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            // Check if teacher exists
            $checkQuery = "SELECT id FROM teachers WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $teacherId);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() === 0) {
                $this->sendError('Không tìm thấy giảng viên', 404);
                return;
            }
            
            // Build update query dynamically
            $updateFields = [];
            $params = [':id' => $teacherId];
            
            $allowedFields = ['name', 'position', 'description', 'image_url'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updateFields[] = "{$field} = :{$field}";
                    $params[":{$field}"] = trim($input[$field]);
                }
            }
            
            if (empty($updateFields)) {
                $this->sendError('Không có dữ liệu để cập nhật', 400);
                return;
            }
            
            $updateQuery = "UPDATE teachers SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            
            foreach ($params as $key => $value) {
                $updateStmt->bindValue($key, $value);
            }
            
            if ($updateStmt->execute()) {
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Cập nhật giảng viên thành công'
                ]);
            } else {
                $this->sendError('Không thể cập nhật giảng viên', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function deleteTeacher($teacherId) {
        try {
            // Check if teacher exists
            $checkQuery = "SELECT id FROM teachers WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $teacherId);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() === 0) {
                $this->sendError('Không tìm thấy giảng viên', 404);
                return;
            }
            
            // Delete teacher
            $deleteQuery = "DELETE FROM teachers WHERE id = :id";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            $deleteStmt->bindParam(':id', $teacherId);
            
            if ($deleteStmt->execute()) {
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Xóa giảng viên thành công'
                ]);
            } else {
                $this->sendError('Không thể xóa giảng viên', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Lỗi server: ' . $e->getMessage(), 500);
        }
    }
    
    private function isAdmin() {
        return isset($_SESSION['user_id']) && isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
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
$teachers = new TeachersAPI();
$teachers->handleRequest();
?>