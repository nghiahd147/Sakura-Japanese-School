<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Contact {
    private $conn;
    private $table_name = "contacts";

    public $id;
    public $name;
    public $email;
    public $phone;
    public $course;
    public $message;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create contact
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    name = :name,
                    email = :email,
                    phone = :phone,
                    course = :course,
                    message = :message,
                    created_at = NOW()";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->course = htmlspecialchars(strip_tags($this->course));
        $this->message = htmlspecialchars(strip_tags($this->message));

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":course", $this->course);
        $stmt->bindParam(":message", $this->message);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Read all contacts
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    $contact = new Contact($db);
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->name) && !empty($data->email) && !empty($data->phone)) {
        $contact->name = $data->name;
        $contact->email = $data->email;
        $contact->phone = $data->phone;
        $contact->course = $data->course ?? '';
        $contact->message = $data->message ?? '';
        
        if($contact->create()) {
            http_response_code(201);
            echo json_encode(array("message" => "Liên hệ đã được gửi thành công!"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Không thể gửi liên hệ."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Dữ liệu không đầy đủ."));
    }
}

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    $contact = new Contact($db);
    $stmt = $contact->read();
    $num = $stmt->rowCount();
    
    if($num > 0) {
        $contacts_arr = array();
        $contacts_arr["records"] = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $contact_item = array(
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "phone" => $phone,
                "course" => $course,
                "message" => $message,
                "created_at" => $created_at
            );
            
            array_push($contacts_arr["records"], $contact_item);
        }
        
        http_response_code(200);
        echo json_encode($contacts_arr);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Không tìm thấy liên hệ nào."));
    }
}
?> 