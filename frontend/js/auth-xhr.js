// Authentication using XMLHttpRequest (fallback)

// Function to show login error message
function showLoginError(message) {
    const errorDiv = document.getElementById('login-error-message');
    const errorText = document.getElementById('login-error-text');
    
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }
}

// Function to hide login error message
function hideLoginError() {
    const errorDiv = document.getElementById('login-error-message');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth XHR loaded');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }
    
    if (!loadingOverlay) {
        console.error('Loading overlay not found!');
        return;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Login form submitted (XHR)');
        
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        
        if (!username || !password) {
            showLoginError('Vui lòng nhập đầy đủ thông tin đăng nhập');
            return;
        }
        
        // Hide any previous error messages
        hideLoginError();
        
        console.log('Login attempt for:', username);
        
        // Show loading
        loadingOverlay.style.display = 'flex';
        loadingOverlay.classList.remove('hidden');
        
        // Create XMLHttpRequest
        const xhr = new XMLHttpRequest();
        
        // Set timeout
        xhr.timeout = 5000; // 5 seconds
        
        xhr.onreadystatechange = function() {
            console.log('XHR state changed:', xhr.readyState, xhr.status);
            
            if (xhr.readyState === 4) {
                // Hide loading
                loadingOverlay.style.display = 'none';
                loadingOverlay.classList.add('hidden');
                
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        console.log('Response data:', data);
                        
                        if (data.success) {
                            showNotification('Đăng nhập thành công! Đang chuyển hướng...', 'success');
                            
                            // Store user data
                            localStorage.setItem('user', JSON.stringify(data.user));
                            localStorage.setItem('session_token', data.session_token);
                            
                            // Redirect
                            setTimeout(() => {
                                if (data.user.role === 'admin') {
                                    window.location.href = 'admin-dashboard.html';
                                } else if (data.user.role === 'teacher') {
                                    window.location.href = 'teacher-dashboard.html';
                                } else {
                                    window.location.href = 'student-dashboard.html';
                                }
                            }, 1500);
                        } else {
                            showLoginError(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.');
                        }
                    } catch (parseError) {
                        console.error('Parse error:', parseError);
                        showLoginError('Lỗi phân tích dữ liệu từ server. Vui lòng thử lại.');
                    }
                } else if (xhr.status === 0) {
                    console.error('HTTP error: 0 - Server không phản hồi');
                    console.log('Possible causes: XAMPP not running, wrong URL, or CORS issue');
                    showLoginError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
                } else if (xhr.status === 401) {
                    console.error('HTTP error: 401 - Unauthorized');
                    showLoginError('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.');
                } else if (xhr.status === 404) {
                    console.error('HTTP error: 404 - Not Found');
                    showLoginError('Không tìm thấy dịch vụ đăng nhập. Vui lòng liên hệ quản trị viên.');
                } else if (xhr.status >= 500) {
                    console.error('HTTP error:', xhr.status, '- Server Error');
                    showLoginError('Lỗi server nội bộ. Vui lòng thử lại sau.');
                } else {
                    console.error('HTTP error:', xhr.status);
                    showLoginError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
                }
            }
        };
        
        xhr.ontimeout = function() {
            console.error('Request timeout');
            loadingOverlay.style.display = 'none';
            loadingOverlay.classList.add('hidden');
            showLoginError('Yêu cầu bị timeout. Vui lòng thử lại.');
        };
        
        xhr.onerror = function() {
            console.error('Request error');
            loadingOverlay.style.display = 'none';
            loadingOverlay.classList.add('hidden');
            showLoginError('Lỗi kết nối. Vui lòng kiểm tra XAMPP có đang chạy không.');
        };
        
        // Auto-detect base URL
        const currentPath = window.location.pathname;
        const basePath = currentPath.includes('/tttn/') ? '/tttn' : '';
        const apiUrl = `http://localhost${basePath}/backend/api/auth.php?action=login`;
        
        // Open and send request
        console.log('Opening XHR request to:', apiUrl);
        xhr.open('POST', apiUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        const requestData = JSON.stringify({
            username: username,
            password: password
        });
        
        console.log('Sending XHR request with data:', requestData);
        xhr.send(requestData);
    });
    
    // Register form handler
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Register form submitted');
            
            const formData = new FormData(registerForm);
            const username = formData.get('username');
            const email = formData.get('email');
            const fullName = formData.get('full_name');
            const phone = formData.get('phone');
            const courseId = formData.get('course_id');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirm_password');
            
            // Validation
            if (!username || !email || !fullName || !password || !confirmPassword) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp');
                return;
            }
            
            if (password.length < 6) {
                alert('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }
            
            // Show loading
            loadingOverlay.style.display = 'flex';
            loadingOverlay.classList.remove('hidden');
            
            // Create XMLHttpRequest for registration
            const xhr = new XMLHttpRequest();
            xhr.timeout = 10000; // 10 seconds for registration
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    loadingOverlay.style.display = 'none';
                    loadingOverlay.classList.add('hidden');
                    
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.success) {
                                alert('Đăng ký thành công! Tài khoản của bạn đang được xét duyệt.');
                                // Switch back to login form
                                registerForm.classList.add('hidden');
                                loginForm.classList.remove('hidden');
                                document.getElementById('form-title').textContent = 'Đăng nhập';
                                document.getElementById('form-subtitle').textContent = 'Chào mừng bạn trở lại với hành trình học tập!';
                                document.getElementById('toggle-text').textContent = 'Chưa có tài khoản học viên?';
                                document.getElementById('toggle-link').innerHTML = '<i class="fas fa-user-plus mr-2"></i>Đăng ký tài khoản mới';
                                // Reset form
                                registerForm.reset();
                            } else {
                                alert('Đăng ký thất bại: ' + (data.error || 'Unknown error'));
                            }
                        } catch (parseError) {
                            console.error('Parse error:', parseError);
                            alert('Lỗi phân tích dữ liệu: ' + parseError.message);
                        }
                    } else {
                        console.error('HTTP error:', xhr.status);
                        alert('Lỗi HTTP: ' + xhr.status);
                    }
                }
            };
            
            xhr.ontimeout = function() {
                loadingOverlay.style.display = 'none';
                loadingOverlay.classList.add('hidden');
                alert('Yêu cầu bị timeout. Vui lòng thử lại.');
            };
            
            xhr.onerror = function() {
                loadingOverlay.style.display = 'none';
                loadingOverlay.classList.add('hidden');
                alert('Lỗi kết nối. Vui lòng kiểm tra XAMPP có đang chạy không.');
            };
            
            // Auto-detect base URL
            const currentPath = window.location.pathname;
            const basePath = currentPath.includes('/tttn/') ? '/tttn' : '';
            const apiUrl = `http://localhost${basePath}/backend/api/auth.php?action=register`;
            
            xhr.open('POST', apiUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            const requestData = JSON.stringify({
                username: username,
                email: email,
                full_name: fullName,
                phone: phone,
                course_id: courseId || null,
                password: password
            });
            
            console.log('Sending registration request:', requestData);
            xhr.send(requestData);
        });
    }
});

// Load courses for registration form
function loadCoursesForRegistration() {
    const courseSelect = document.getElementById('register-course');
    if (!courseSelect) return;
    
    const currentPath = window.location.pathname;
    const basePath = currentPath.includes('/tttn/') ? '/tttn' : '';
    const apiUrl = `http://localhost${basePath}/backend/api/courses_api.php`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                courseSelect.innerHTML = '<option value="">Chọn khóa học</option>';
                data.data.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course.id;
                    option.textContent = course.name;
                    courseSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading courses:', error);
        });
}

// Notification System
function showNotification(message, type = 'info', title = null, duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set up notification content
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    const titles = {
        success: title || 'Thành công',
        error: title || 'Lỗi',
        warning: title || 'Cảnh báo',
        info: title || 'Thông tin'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="notification-text">
                <div class="notification-title">${titles[type]}</div>
                <div class="notification-message">${message}</div>
            </div>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to container
    container.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notification.querySelector('.notification-close'));
        }, duration);
    }

    return notification;
}

function closeNotification(closeButton) {
    const notification = closeButton.closest('.notification');
    if (!notification) return;

    notification.classList.remove('show');
    notification.classList.add('leaving');
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Toggle password visibility function
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = passwordInput.nextElementSibling;
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        toggleButton.setAttribute('title', 'Ẩn mật khẩu');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        toggleButton.setAttribute('title', 'Hiển thị mật khẩu');
    }
}

// Initialize form toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const toggleFormBtn = document.getElementById('toggle-form');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const toggleText = document.getElementById('toggle-text');
    const toggleLink = document.getElementById('toggle-link');
    
    let isLoginMode = true;
    
    // Load courses for registration form
    loadCoursesForRegistration();
    
    if (toggleFormBtn) {
        toggleFormBtn.addEventListener('click', function() {
            if (isLoginMode) {
                // Switch to register mode
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                formTitle.textContent = 'Đăng ký';
                formSubtitle.textContent = 'Tạo tài khoản học viên mới để bắt đầu hành trình học tập!';
                toggleText.textContent = 'Đã có tài khoản học viên?';
                toggleLink.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập ngay';
                isLoginMode = false;
            } else {
                // Switch to login mode
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                formTitle.textContent = 'Đăng nhập';
                formSubtitle.textContent = 'Chào mừng bạn trở lại với hành trình học tập!';
                toggleText.textContent = 'Chưa có tài khoản học viên?';
                toggleLink.innerHTML = '<i class="fas fa-user-plus mr-2"></i>Đăng ký tài khoản mới';
                isLoginMode = true;
            }
        });
    }
});