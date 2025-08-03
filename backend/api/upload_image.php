<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Start session
session_start();

class ImageUpload {
    private $uploadDir;
    private $allowedTypes;
    private $maxFileSize;
    
    public function __construct() {
        $this->uploadDir = '../../frontend/uploads/teachers/';
        $this->allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $this->maxFileSize = 5 * 1024 * 1024; // 5MB
        
        // Create upload directory if it doesn't exist
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    public function handleUpload() {
        // Check if user is authenticated and is admin
        if (!$this->isAdmin()) {
            $this->sendError('Không có quyền truy cập', 403);
            return;
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendError('Method not allowed', 405);
            return;
        }
        
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $this->sendError('Không có file được upload hoặc có lỗi xảy ra', 400);
            return;
        }
        
        $file = $_FILES['image'];
        
        // Validate file
        $validation = $this->validateFile($file);
        if (!$validation['valid']) {
            $this->sendError($validation['message'], 400);
            return;
        }
        
        // Generate unique filename
        $filename = $this->generateUniqueFilename($file['name']);
        $filepath = $this->uploadDir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            // Return the relative URL path
            $imageUrl = 'uploads/teachers/' . $filename;
            
            $this->sendResponse([
                'success' => true,
                'message' => 'Upload ảnh thành công',
                'image_url' => $imageUrl,
                'filename' => $filename
            ]);
        } else {
            $this->sendError('Không thể lưu file', 500);
        }
    }
    
    private function validateFile($file) {
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return [
                'valid' => false,
                'message' => 'File quá lớn. Kích thước tối đa là 5MB'
            ];
        }
        
        // Check file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $this->allowedTypes)) {
            return [
                'valid' => false,
                'message' => 'Định dạng file không hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF'
            ];
        }
        
        // Check if file is actually an image
        $imageInfo = getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            return [
                'valid' => false,
                'message' => 'File không phải là ảnh hợp lệ'
            ];
        }
        
        return ['valid' => true];
    }
    
    private function generateUniqueFilename($originalName) {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Clean filename
        $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '', $baseName);
        $baseName = substr($baseName, 0, 50); // Limit length
        
        // Generate unique name
        $timestamp = time();
        $random = mt_rand(1000, 9999);
        
        return $baseName . '_' . $timestamp . '_' . $random . '.' . $extension;
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
$upload = new ImageUpload();
$upload->handleUpload();
?>