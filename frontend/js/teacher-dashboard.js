// Teacher Dashboard JavaScript
class TeacherDashboard {
    constructor() {
        this.user = null;
        this.courses = [];
        this.init();
    }

    async init() {
        // Check authentication
        if (!await this.checkAuth()) {
            window.location.href = 'auth.html';
            return;
        }

        this.bindEvents();
        await this.loadCourses();

        this.updateStats();
        this.loadRecentActivities();
        

    }

    async checkAuth() {
        try {
            // Check localStorage first
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.role === 'teacher') {
                    this.user = user;
                    document.getElementById('teacher-name').textContent = user.username || user.full_name || 'Giáo viên';
                    return true;
                }
            }

            // Fallback to API check
            const response = await fetch('/tttn/backend/api/auth.php?action=check');
            const data = await response.json();
            
            if (!data.authenticated || data.user.role !== 'teacher') {
                return false;
            }

            this.user = data.user;
            document.getElementById('teacher-name').textContent = data.user.username || data.user.full_name || 'Giáo viên';
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            // If API fails but we have valid localStorage, still allow access
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.role === 'teacher') {
                    this.user = user;
                    document.getElementById('teacher-name').textContent = user.username || user.full_name || 'Giáo viên';
                    return true;
                }
            }
            return false;
        }
    }

    bindEvents() {
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Add course
        document.getElementById('add-course-btn').addEventListener('click', () => this.showCourseModal());



        // Forms
        document.getElementById('course-form').addEventListener('submit', (e) => this.handleCourseSubmit(e));





        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    async loadCourses() {
        this.showLoading(true);
        
        try {
            const response = await fetch('/tttn/backend/api/courses_api.php?limit=50');
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get response text first to debug
            const responseText = await response.text();
            console.log('Load Courses API Response:', responseText);

            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response was:', responseText);
                throw new Error('Server trả về dữ liệu không hợp lệ');
            }

            if (data.success) {
                this.courses = data.data || [];
                console.log('Loaded courses from API:', this.courses.length);
            } else {
                console.error('Failed to load courses:', data.message);
                this.courses = [];
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            this.courses = [];
        } finally {
            this.renderCourses();
            this.populateCourseFilter();
            this.showLoading(false);
        }
    }





    renderCourses() {
        const container = document.getElementById('teacher-courses');
        container.innerHTML = '';

        if (this.courses.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-book text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">Chưa có khóa học nào</p>
                    <button onclick="teacherDashboard.showCourseModal()" class="btn-primary mt-4">
                        Tạo khóa học đầu tiên
                    </button>
                </div>
            `;
            return;
        }

        this.courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow';
            
            courseCard.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="text-xl font-bold text-gray-800">${course.name}</h4>
                        <p class="text-gray-600">${course.level}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button data-action="edit" data-course-id="${course.id}" class="text-blue-500 hover:text-blue-600">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button data-action="delete" data-course-id="${course.id}" data-course-name="${course.name}" class="text-red-500 hover:text-red-600">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <p class="text-gray-600 mb-4">${course.description}</p>
                
                <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                        <span class="text-gray-500">Thời lượng:</span>
                        <div class="font-medium">${course.duration}</div>
                    </div>
                    <div>
                        <span class="text-gray-500">Học phí:</span>
                        <div class="font-medium text-green-600">${new Intl.NumberFormat('vi-VN').format(course.price)} VNĐ</div>
                    </div>
                    <div>
                        <span class="text-gray-500">Học viên:</span>
                        <div class="font-medium">${course.student_count || 0}</div>
                    </div>
                    <div>
                        <span class="text-gray-500">Trạng thái:</span>
                        <div class="font-medium text-blue-600">Đang hoạt động</div>
                    </div>
                </div>
                

            `;
            
            // Add event listeners for all action buttons
            const editBtn = courseCard.querySelector('[data-action="edit"]');
            const deleteBtn = courseCard.querySelector('[data-action="delete"]');

            
            editBtn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const courseId = button.dataset.courseId;
                // Edit course
                this.editCourse(courseId);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const courseId = button.dataset.courseId;
                const courseName = button.dataset.courseName;
                // Delete course
                this.deleteCourse(courseId, courseName);
            });
            

            
            container.appendChild(courseCard);
        });
    }



    populateCourseFilter() {
        // This function is no longer needed since we removed the course filter
        // But we keep it to prevent errors
    }

    updateStats() {
        // Update course count
        document.getElementById('total-courses').textContent = this.courses.length;

        // Update student count (placeholder)
        document.getElementById('total-students').textContent = '0';

        // Update active enrollments (placeholder)
        document.getElementById('active-enrollments').textContent = '0';

        // Calculate average rating from real data (placeholder for now)
        document.getElementById('avg-rating').textContent = this.courses.length > 0 ? '4.5' : '0';
    }

    async loadRecentActivities() {
        const container = document.getElementById('recent-activities');
        
        try {
            // Try to load real activities from API
            const response = await fetch('/tttn/backend/api/activities.php?limit=5');
            const data = await response.json();
            
            if (data.success && data.data && data.data.length > 0) {
                this.renderActivities(data.data, container);
            } else {
                this.showNoActivitiesMessage(container);
            }
        } catch (error) {
            console.log('Activities API not available, showing placeholder');
            this.showNoActivitiesMessage(container);
        }
    }

    renderActivities(activities, container) {
        container.innerHTML = '';
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'flex items-start space-x-3 p-2';
            
            // Map activity types to icons and colors
            const iconMap = {
                'enrollment': { icon: 'fas fa-user-plus', color: 'text-green-500' },
                'completion': { icon: 'fas fa-graduation-cap', color: 'text-blue-500' },
                'rating': { icon: 'fas fa-star', color: 'text-yellow-500' },
                'update': { icon: 'fas fa-book', color: 'text-purple-500' },
                'default': { icon: 'fas fa-bell', color: 'text-gray-500' }
            };
            
            const iconInfo = iconMap[activity.type] || iconMap.default;
            
            item.innerHTML = `
                <i class="${iconInfo.icon} ${iconInfo.color}"></i>
                <div class="flex-1">
                    <p class="text-sm text-gray-800">${activity.description}</p>
                    <p class="text-xs text-gray-500">${this.formatTimeAgo(activity.created_at)}</p>
                </div>
            `;
            container.appendChild(item);
        });
    }

    showNoActivitiesMessage(container) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-clock text-2xl mb-2"></i>
                <p>Chưa có hoạt động gần đây</p>
            </div>
        `;
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }

    // Modal methods
    showCourseModal(course = null) {
        const modal = document.getElementById('course-modal');
        const title = document.getElementById('course-modal-title');
        const form = document.getElementById('course-form');
        
        form.reset();
        
        if (course) {
            title.textContent = 'Sửa khóa học';
            document.getElementById('course-id').value = course.id;
            document.getElementById('course-name').value = course.name;
            document.getElementById('course-description').value = course.description;
            document.getElementById('course-duration').value = course.duration;
            document.getElementById('course-level').value = course.level;
            document.getElementById('course-price').value = course.price;
        } else {
            title.textContent = 'Thêm khóa học';
            document.getElementById('course-id').value = '';
        }
        
        modal.classList.remove('hidden');
    }



    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // CRUD operations
    async handleCourseSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const courseId = document.getElementById('course-id').value;
        
        const courseData = {
            name: formData.get('name') || document.getElementById('course-name').value,
            description: formData.get('description') || document.getElementById('course-description').value,
            duration: formData.get('duration') || document.getElementById('course-duration').value,
            level: formData.get('level') || document.getElementById('course-level').value,
            price: parseFloat(formData.get('price') || document.getElementById('course-price').value)
        };

        // Add ID for update
        if (courseId) {
            courseData.id = parseInt(courseId);
        }

        // Validate required fields
        if (!courseData.name || !courseData.description || !courseData.duration || !courseData.level || !courseData.price) {
            this.showNotification('Vui lòng điền đầy đủ thông tin khóa học', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const url = '/tttn/backend/api/courses_api.php';
            const method = courseId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData)
            });

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get response text first to debug
            const responseText = await response.text();
            console.log('API Response:', responseText);

            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response was:', responseText);
                throw new Error('Server trả về dữ liệu không hợp lệ');
            }

            if (data.success) {
                this.showNotification(data.message || 'Lưu khóa học thành công!', 'success');
                this.closeModal('course-modal');
                await this.loadCourses();
                this.updateStats();
            } else {
                this.showNotification(data.message || 'Có lỗi xảy ra khi lưu khóa học', 'error');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            this.showNotification('Không thể kết nối đến server. Vui lòng thử lại sau.', 'error');
        } finally {
            this.showLoading(false);
        }
    }



    async editCourse(courseId) {
        // Find course in local data (already loaded from API)
        const course = this.courses.find(c => c.id == courseId);
        if (course) {
            this.showCourseModal(course);
        } else {
            this.showNotification('Không tìm thấy khóa học', 'error');
        }
    }



    async deleteCourse(courseId, courseName) {
        // Get course name from local data for safety
        const course = this.courses.find(c => c.id == courseId);
        const safeName = course ? course.name : (courseName || 'khóa học này');
        
        if (!confirm(`Bạn có chắc chắn muốn xóa khóa học "${safeName}"?`)) {
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/tttn/backend/api/courses_api.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: parseInt(courseId) })
            });

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get response text first to debug
            const responseText = await response.text();
            console.log('Delete API Response:', responseText);

            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response was:', responseText);
                throw new Error('Server trả về dữ liệu không hợp lệ');
            }

            if (data.success) {
                this.showNotification(data.message || 'Xóa khóa học thành công!', 'success');
                await this.loadCourses();
                this.updateStats();
            } else {
                this.showNotification(data.message || 'Có lỗi xảy ra khi xóa khóa học', 'error');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showNotification('Không thể kết nối đến server. Vui lòng thử lại sau.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Functions for quick action buttons
    viewAllStudents() {
        this.showNotification('Tính năng xem tất cả học viên đang được phát triển', 'info');
    }

    exportStudentList() {
        this.showNotification('Tính năng xuất danh sách học viên đang được phát triển', 'info');
    }

    async logout() {
        try {
            await fetch('/tttn/backend/api/auth.php?action=logout', {
                method: 'DELETE'
            });
            
            localStorage.removeItem('user');
            localStorage.removeItem('session_token');
            window.location.href = 'auth.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'auth.html';
        }
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        // Ensure message is not undefined
        const safeMessage = message || 'Thao tác đã được thực hiện';
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
                <span>${safeMessage}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Global functions
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
};

// Initialize dashboard
let teacherDashboard;
document.addEventListener('DOMContentLoaded', function() {
    teacherDashboard = new TeacherDashboard();
});