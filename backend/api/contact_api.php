<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

class ContactAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        try {
            switch($method) {
                case 'GET':
                    $this->getContacts();
                    break;
                case 'POST':
                    $this->createContact();
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
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }
    
    private function getContacts() {
        try {
            $query = "SELECT c.*, cr.name as course_name 
                     FROM contacts c 
                     LEFT JOIN courses cr ON c.course_id = cr.id 
                     ORDER BY c.created_at DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $contacts,
                'total' => count($contacts)
            ]);
            
        } catch (Exception $e) {
            throw new Exception("Error fetching contacts: " . $e->getMessage());
        }
    }
    
    private function createContact() {
        try {
            $raw_input = file_get_contents('php://input');
            error_log("Raw input: " . $raw_input);
            
            $input = json_decode($raw_input, true);
            error_log("Decoded input: " . print_r($input, true));
            
            if ($input === null) {
                error_log("JSON decode failed: " . json_last_error_msg());
                echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
                return;
            }
            
            // Validate required fields
            $required_fields = ['first_name', 'last_name', 'email', 'phone', 'course_id', 'message'];
            foreach ($required_fields as $field) {
                if (empty($input[$field])) {
                    echo json_encode(['success' => false, 'message' => "Thiếu thông tin: {$field}"]);
                    return;
                }
            }
            
            // Validate email format
            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'message' => 'Email không hợp lệ']);
                return;
            }
            
            // Insert contact
            $query = "INSERT INTO contacts 
                     (first_name, last_name, email, phone, country_code, course_id, message, nationality, status, created_at) 
                     VALUES 
                     (:first_name, :last_name, :email, :phone, :country_code, :course_id, :message, :nationality, 'new', NOW())";
            
            $stmt = $this->conn->prepare($query);
            
            $country_code = $input['country_code'] ?? '+84';
            $nationality = $input['nationality'] ?? 'Việt Nam';
            
            $stmt->bindParam(':first_name', $input['first_name']);
            $stmt->bindParam(':last_name', $input['last_name']);
            $stmt->bindParam(':email', $input['email']);
            $stmt->bindParam(':phone', $input['phone']);
            $stmt->bindParam(':country_code', $country_code);
            $stmt->bindParam(':course_id', $input['course_id']);
            $stmt->bindParam(':message', $input['message']);
            $stmt->bindParam(':nationality', $nationality);
            
            if ($stmt->execute()) {
                $contact_id = $this->conn->lastInsertId();
                
                // Get the created contact with course info
                $query = "SELECT c.*, cr.name as course_name 
                         FROM contacts c 
                         LEFT JOIN courses cr ON c.course_id = cr.id 
                         WHERE c.id = :id";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $contact_id);
                $stmt->execute();
                
                $contact = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Liên hệ đã được gửi thành công!',
                    'data' => $contact
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Không thể lưu thông tin liên hệ']);
            }
            
        } catch (Exception $e) {
            throw new Exception("Error creating contact: " . $e->getMessage());
        }
    }
}

// Handle the request
$api = new ContactAPI();
$api->handleRequest();
?>