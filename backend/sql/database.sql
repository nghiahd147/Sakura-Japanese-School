-- Create database
CREATE DATABASE IF NOT EXISTS japanese_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE japanese_school;

-- Create contacts table (updated)
DROP TABLE IF EXISTS contacts;
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country_code VARCHAR(10) DEFAULT '+84',
    course_id INT,
    message TEXT NOT NULL,
    nationality VARCHAR(100) DEFAULT 'Việt Nam',
    status ENUM('new', 'contacted', 'enrolled', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create courses table (updated)
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    description TEXT,
    duration_weeks INT NOT NULL,
    total_hours INT NOT NULL,
    price DECIMAL(12,0) NOT NULL,
    features TEXT,
    level_order INT DEFAULT 1,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for courses (updated)
INSERT INTO courses (name, level, description, duration_weeks, total_hours, price, features, level_order) VALUES
('Khóa Học Cơ Bản', 'N5', 'Dành cho người mới bắt đầu học tiếng Nhật. Học bảng chữ cái Hiragana, Katakana và ngữ pháp cơ bản N5.', 12, 96, 3500000, 'Hiragana & Katakana|Ngữ pháp cơ bản N5|Giao tiếp hàng ngày', 1),
('Khóa Học Trung Cấp', 'N4-N3', 'Nâng cao kỹ năng tiếng Nhật với ngữ pháp N4-N3, luyện thi JLPT và tìm hiểu văn hóa Nhật Bản.', 16, 128, 4500000, 'Ngữ pháp N4-N3|Luyện thi JLPT|Văn hóa Nhật Bản', 2),
('Khóa Học Cao Cấp', 'N2-N1', 'Chuẩn bị cho đại học Nhật Bản với ngữ pháp N2-N1, viết luận văn và phỏng vấn đại học.', 20, 160, 5500000, 'Ngữ pháp N2-N1|Viết luận văn|Phỏng vấn đại học', 3);

-- Create users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('admin', 'teacher', 'student') DEFAULT 'student',
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    enrollment_date DATE,
    course_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sessions table for user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create enrollments table to track student course enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for teachers
INSERT INTO teachers (name, position, description, image_url) VALUES
('Yamamoto Sensei', 'Giám đốc học thuật', 'Giảng viên có hơn 20 năm kinh nghiệm giảng dạy tiếng Nhật cho học viên quốc tế.', '/images/teachers/yamamoto.jpg'),
('Tanaka Sensei', 'Giảng viên chính', 'Chuyên gia về ngữ pháp và luyện thi JLPT với tỷ lệ đỗ cao.', '/images/teachers/tanaka.jpg'),
('Sato Sensei', 'Giảng viên văn hóa', 'Chuyên gia về văn hóa Nhật Bản và giao tiếp thực tế.', '/images/teachers/sato.jpg'),
('Watanabe Sensei', 'Giảng viên giao tiếp', 'Chuyên gia về kỹ năng giao tiếp và phát âm tiếng Nhật.', '/images/teachers/watanabe.jpg');

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, role, status) VALUES
('admin', 'admin@tokyolanguage.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản trị viên', 'admin', 'active');

-- Insert sample teacher users
INSERT INTO users (username, email, password, full_name, role, status) VALUES
('yamamoto', 'yamamoto@tokyolanguage.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Yamamoto Sensei', 'teacher', 'active'),
('tanaka', 'tanaka@tokyolanguage.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tanaka Sensei', 'teacher', 'active');

-- Insert sample student user (password: student123)
INSERT INTO users (username, email, password, full_name, phone, role, status, enrollment_date, course_id) VALUES
('student01', 'student@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn A', '0901234567', 'student', 'active', CURDATE(), 1); 