# 東京語文学院 - Trường Nhật Ngữ Tokyo

Website giới thiệu trường học Nhật Bản với phong cách anime và hiệu ứng sakura.

## 🎯 Tính năng

- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS
- **Backend**: PHP, MySQL
- **Hiệu ứng**: Animation sakura, scroll effects, hover effects
- **Responsive**: Tương thích với mọi thiết bị
- **Phong cách**: Anime Nhật Bản với màu sắc tươi sáng

## 📁 Cấu trúc dự án

```
tttn/
├── frontend/
│   ├── css/
│   │   └── styles.css           # CSS tùy chỉnh
│   ├── js/
│   │   ├── script.js            # JavaScript chính
│   │   ├── course-registration.js
│   │   ├── admin-dashboard.js
│   │   ├── teacher-dashboard.js
│   │   ├── student-dashboard.js
│   │   ├── auth-xhr.js
│   │   └── course-landing-functions.js
│   ├── img/                     # Hình ảnh
│   ├── uploads/                 # File upload
│   ├── index.html               # Trang chủ
│   ├── course-registration.html # Trang đăng ký khóa học
│   ├── auth.html               # Trang đăng nhập
│   ├── admin-dashboard.html    # Dashboard quản trị
│   ├── teacher-dashboard.html  # Dashboard giáo viên
│   └── student-dashboard.html  # Dashboard học viên
├── backend/
│   ├── config/
│   │   └── database.php        # Cấu hình database
│   ├── api/
│   │   ├── auth.php           # API xác thực
│   │   ├── users.php          # API quản lý người dùng
│   │   ├── courses_api.php    # API khóa học
│   │   ├── teachers_api.php   # API giáo viên
│   │   ├── enrollments_api.php # API đăng ký học
│   │   ├── contact_api.php    # API liên hệ
│   │   └── upload_image.php   # API upload ảnh
│   ├── sql/
│   │   └── database.sql       # File SQL tạo database
│   └── setup_database.php     # Script thiết lập database
└── README.md
```

## 🚀 Cách cài đặt và chạy

### Bước 1: Cài đặt môi trường

1. **Cài đặt XAMPP** (hoặc WAMP/MAMP):
   - Tải XAMPP từ: https://www.apachefriends.org/
   - Cài đặt và khởi động Apache và MySQL

2. **Cài đặt PHP** (nếu chưa có):
   - PHP 7.4 trở lên
   - Extension PDO MySQL

### Bước 2: Thiết lập database

**Cách 1: Sử dụng script tự động (Khuyến nghị)**
```bash
# Chạy script setup database
php backend/setup_database.php
# Hoặc nếu PHP không có trong PATH
C:\xampp\php\php.exe backend/setup_database.php
```

**Cách 2: Thủ công qua phpMyAdmin**
1. **Mở phpMyAdmin**:
   - Truy cập: http://localhost/phpmyadmin
   - Đăng nhập với username: `root`, password: `` (để trống)

2. **Import database**:
   - Tạo database mới tên `japanese_school`
   - Import file `backend/sql/database.sql`

**Cách 3: Chạy SQL trực tiếp**:
```sql
-- Tạo database
CREATE DATABASE IF NOT EXISTS japanese_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE japanese_school;

-- Tạo bảng contacts
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    course VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Bước 3: Cấu hình dự án

1. **Copy dự án vào thư mục web**:
   - Copy toàn bộ thư mục `tttn` vào `htdocs` của XAMPP
   - Đường dẫn: `C:\xampp\htdocs\tttn\`

2. **Cấu hình database** (nếu cần):
   - Mở file `backend/config/database.php`
   - Thay đổi thông tin kết nối nếu cần:
     ```php
     private $host = "localhost";
     private $db_name = "japanese_school";
     private $username = "root";
     private $password = "";
     ```

### Bước 4: Chạy dự án

1. **Khởi động XAMPP**:
   - Mở XAMPP Control Panel
   - Start Apache và MySQL

2. **Truy cập website**:
   - Mở trình duyệt
   - Truy cập: `http://localhost/tttn/frontend/`

## 🎨 Tính năng chính

### Frontend
- ✅ Responsive design với Tailwind CSS
- ✅ Hiệu ứng sakura rơi
- ✅ Animation scroll và hover
- ✅ Form liên hệ với validation
- ✅ Loading screen
- ✅ Smooth scrolling
- ✅ Mobile menu

### Backend
- ✅ API xử lý form liên hệ
- ✅ Database MySQL
- ✅ Sanitize input data
- ✅ JSON response

## 🎭 Hiệu ứng đặc biệt

1. **Sakura Animation**: Hoa anh đào rơi liên tục
2. **Scroll Animations**: Hiệu ứng xuất hiện khi scroll
3. **Hover Effects**: Hiệu ứng khi hover vào các element
4. **Loading Screen**: Màn hình loading với spinner
5. **Particle Effects**: Hiệu ứng hạt bay
6. **Floating Button**: Nút lên đầu trang

## 📱 Responsive Design

- **Desktop**: Tối ưu cho màn hình lớn
- **Tablet**: Layout thích ứng cho tablet
- **Mobile**: Menu hamburger, layout dọc

## 🛠️ Công nghệ sử dụng

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, Animations
- **JavaScript**: ES6+, DOM manipulation
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icons
- **Google Fonts**: Noto Sans JP

### Backend
- **PHP**: Server-side scripting
- **MySQL**: Database
- **PDO**: Database connection
- **JSON**: API response format

## 🎯 Phong cách thiết kế

- **Màu sắc**: Pink, Purple, Blue gradient
- **Typography**: Noto Sans JP (font Nhật)
- **Icons**: Font Awesome
- **Animations**: Smooth và mượt mà
- **Layout**: Modern và clean

## 🔧 Tùy chỉnh

### Thay đổi màu sắc
Chỉnh sửa file `frontend/styles.css`:
```css
/* Thay đổi gradient colors */
.btn-primary {
    @apply bg-gradient-to-r from-pink-500 to-purple-600;
}
```

### Thêm hiệu ứng mới
Thêm vào file `frontend/script.js`:
```javascript
// Thêm hiệu ứng mới
function newEffect() {
    // Code hiệu ứng
}
```

## 📞 Liên hệ

Nếu có vấn đề hoặc cần hỗ trợ:
- Email: qn500787@gmail.com
- GitHub: https://github.com/nghiahd147

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

**Lưu ý**: Đảm bảo Apache và MySQL đang chạy trước khi truy cập website! 