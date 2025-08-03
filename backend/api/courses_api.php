<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

class CoursesAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        
        // Check if connection is successful
        if (!$this->conn) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed']);
            exit;
        }
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        try {
            switch($method) {
                case 'GET':
                    $this->getCourses();
                    break;
                case 'POST':
                    $this->createCourse();
                    break;
                case 'PUT':
                    $this->updateCourse();
                    break;
                case 'DELETE':
                    $this->deleteCourse();
                    break;
                case 'OPTIONS':
                    http_response_code(200);
                    break;
                default:
                    http_response_code(405);
                    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                    break;
            }
        } catch (Exception $e) {
            error_log('CoursesAPI Error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }
    
    private function getCourses() {
        try {
            $query = "SELECT 
                        c.*,
                        COUNT(e.id) as student_count
                      FROM courses c
                      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
                      GROUP BY c.id
                      ORDER BY c.id ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert student_count to integer
            foreach ($courses as &$course) {
                $course['student_count'] = (int)$course['student_count'];
            }
            
            echo json_encode([
                'success' => true,
                'data' => $courses,
                'total' => count($courses)
            ]);
            
        } catch (Exception $e) {
            throw new Exception("Error fetching courses: " . $e->getMessage());
        }
    }
    
    private function createCourse() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $required_fields = ['name', 'level', 'duration', 'price'];
            foreach ($required_fields as $field) {
                if (empty($input[$field])) {
                    echo json_encode(['success' => false, 'message' => "Thiếu thông tin: {$field}"]);
                    return;
                }
            }
            
            $query = "INSERT INTO courses 
                     (name, level, description, duration, price, status, created_at) 
                     VALUES 
                     (:name, :level, :description, :duration, :price, 'active', NOW())";
            
            $stmt = $this->conn->prepare($query);
            
            $name = $input['name'];
            $level = $input['level'];
            $description = $input['description'] ?? '';
            $duration = $input['duration'];
            $price = $input['price'];
            
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':level', $level);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':duration', $duration);
            $stmt->bindParam(':price', $price);
            
            if ($stmt->execute()) {
                $course_id = $this->conn->lastInsertId();
                
                // Get the created course with student count
                $query = "SELECT 
                            c.*,
                            COUNT(e.id) as student_count
                          FROM courses c
                          LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
                          WHERE c.id = :id
                          GROUP BY c.id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $course_id);
                $stmt->execute();
                
                $course = $stmt->fetch(PDO::FETCH_ASSOC);
                $course['student_count'] = (int)$course['student_count'];
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Khóa học đã được tạo thành công!',
                    'data' => $course
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Không thể tạo khóa học']);
            }
            
        } catch (Exception $e) {
            throw new Exception("Error creating course: " . $e->getMessage());
        }
    }
    
    private function updateCourse() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
                echo json_encode(['success' => false, 'message' => 'Thiếu ID khóa học']);
                return;
            }
            
            $query = "UPDATE courses SET 
                     name = :name,
                     level = :level,
                     description = :description,
                     duration = :duration,
                     price = :price,
                     status = :status
                     WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $id = $input['id'];
            $name = $input['name'];
            $level = $input['level'];
            $description = $input['description'];
            $duration = $input['duration'];
            $price = $input['price'];
            $status = $input['status'] ?? 'active';
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':level', $level);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':duration', $duration);
            $stmt->bindParam(':price', $price);
            $stmt->bindParam(':status', $status);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Khóa học đã được cập nhật thành công!'
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Không thể cập nhật khóa học']);
            }
            
        } catch (Exception $e) {
            throw new Exception("Error updating course: " . $e->getMessage());
        }
    }
    
    private function deleteCourse() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
                echo json_encode(['success' => false, 'message' => 'Thiếu ID khóa học']);
                return;
            }
            
            $query = "DELETE FROM courses WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $id = $input['id'];
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Khóa học đã được xóa thành công!'
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Không thể xóa khóa học']);
            }
            
        } catch (Exception $e) {
            throw new Exception("Error deleting course: " . $e->getMessage());
        }
    }
}

// Handle the request
$api = new CoursesAPI();
$api->handleRequest();
?>