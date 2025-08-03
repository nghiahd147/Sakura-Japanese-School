<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

class EnrollmentsAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function handleRequest() {
        $action = $_GET['action'] ?? '';
        
        try {
            switch ($action) {
                case 'enroll':
                    return $this->enrollStudent();
                case 'get_student_enrollments':
                    return $this->getStudentEnrollments();
                case 'get_available_courses':
                    return $this->getAvailableCourses();
                case 'update_progress':
                    return $this->updateProgress();
                case 'drop_course':
                    return $this->dropCourse();
                default:
                    return ['success' => false, 'message' => 'Invalid action'];
            }
        } catch (Exception $e) {
            error_log('Enrollments API Error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Server error occurred'];
        }
    }
    
    private function enrollStudent() {
        // Check if user is authenticated and is a student
        session_start();
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['course_id'])) {
            return ['success' => false, 'message' => 'Course ID is required'];
        }
        
        $studentId = $_SESSION['user_id'];
        $courseId = $input['course_id'];
        
        try {
            // Check if course exists and is active
            $stmt = $this->pdo->prepare("SELECT id, name FROM courses WHERE id = ? AND status = 'active'");
            $stmt->execute([$courseId]);
            $course = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$course) {
                return ['success' => false, 'message' => 'Course not found or inactive'];
            }
            
            // Check if student is already enrolled
            $stmt = $this->pdo->prepare("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?");
            $stmt->execute([$studentId, $courseId]);
            
            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'Bạn đã đăng ký khóa học này rồi'];
            }
            
            // Enroll the student
            $stmt = $this->pdo->prepare("
                INSERT INTO enrollments (student_id, course_id, enrollment_date, status, progress_percentage) 
                VALUES (?, ?, CURDATE(), 'active', 0.00)
            ");
            $stmt->execute([$studentId, $courseId]);
            
            return [
                'success' => true, 
                'message' => 'Đăng ký khóa học thành công!',
                'course_name' => $course['name']
            ];
            
        } catch (PDOException $e) {
            error_log('Database error in enrollStudent: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Database error occurred'];
        }
    }
    
    private function getStudentEnrollments() {
        // Check if user is authenticated and is a student
        session_start();
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $studentId = $_SESSION['user_id'];
        
        try {
            $stmt = $this->pdo->prepare("
                SELECT e.id, e.student_id, e.course_id, e.enrollment_date, e.status, 
                       COALESCE(e.progress_percentage, 0) as progress_percentage, e.created_at,
                       c.name as course_name, c.level, c.description, c.duration, c.price
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                WHERE e.student_id = ?
                ORDER BY e.enrollment_date DESC
            ");
            $stmt->execute([$studentId]);
            $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'enrollments' => $enrollments
            ];
            
        } catch (PDOException $e) {
            error_log('Database error in getStudentEnrollments: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Database error occurred'];
        }
    }
    
    private function getAvailableCourses() {
        // Check if user is authenticated and is a student
        session_start();
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $studentId = $_SESSION['user_id'];
        
        try {
            // Get courses that the student is not enrolled in
            $stmt = $this->pdo->prepare("
                SELECT c.* 
                FROM courses c
                WHERE c.status = 'active' 
                AND c.id NOT IN (
                    SELECT course_id 
                    FROM enrollments 
                    WHERE student_id = ?
                )
                ORDER BY c.id ASC
            ");
            $stmt->execute([$studentId]);
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'courses' => $courses
            ];
            
        } catch (PDOException $e) {
            error_log('Database error in getAvailableCourses: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Database error occurred'];
        }
    }
    
    private function updateProgress() {
        // Check if user is authenticated and is a student
        session_start();
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['enrollment_id']) || !isset($input['progress'])) {
            return ['success' => false, 'message' => 'Enrollment ID and progress are required'];
        }
        
        $studentId = $_SESSION['user_id'];
        $enrollmentId = $input['enrollment_id'];
        $progress = min(100, max(0, floatval($input['progress']))); // Ensure progress is between 0-100
        
        try {
            // Verify the enrollment belongs to the student
            $stmt = $this->pdo->prepare("
                UPDATE enrollments 
                SET progress_percentage = ? 
                WHERE id = ? AND student_id = ?
            ");
            $result = $stmt->execute([$progress, $enrollmentId, $studentId]);
            
            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Enrollment not found'];
            }
            
            return [
                'success' => true,
                'message' => 'Cập nhật tiến độ thành công!',
                'progress' => $progress
            ];
            
        } catch (PDOException $e) {
            error_log('Database error in updateProgress: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Database error occurred'];
        }
    }
    
    private function dropCourse() {
        // Check if user is authenticated and is a student
        session_start();
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['enrollment_id'])) {
            return ['success' => false, 'message' => 'Enrollment ID is required'];
        }
        
        $studentId = $_SESSION['user_id'];
        $enrollmentId = $input['enrollment_id'];
        
        try {
            // Update enrollment status to dropped
            $stmt = $this->pdo->prepare("
                UPDATE enrollments 
                SET status = 'dropped' 
                WHERE id = ? AND student_id = ?
            ");
            $result = $stmt->execute([$enrollmentId, $studentId]);
            
            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Enrollment not found'];
            }
            
            return [
                'success' => true,
                'message' => 'Đã hủy đăng ký khóa học thành công!'
            ];
            
        } catch (PDOException $e) {
            error_log('Database error in dropCourse: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Database error occurred'];
        }
    }
}

// Initialize and handle request
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=japanese_school;charset=utf8mb4",
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $api = new EnrollmentsAPI($pdo);
    $response = $api->handleRequest();
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    error_log('Database connection error: ' . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed'
    ], JSON_UNESCAPED_UNICODE);
}
?> 