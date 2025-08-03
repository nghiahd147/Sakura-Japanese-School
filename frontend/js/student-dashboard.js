// Student Dashboard JavaScript
class StudentDashboard {
    constructor() {
        this.user = null;
        this.enrollments = [];
        this.availableCourses = [];
        this.init();
    }

    async init() {
        // Check authentication
        if (!await this.checkAuth()) {
            window.location.href = 'auth.html';
            return;
        }

        this.bindEvents();
        await this.loadProfile();
        await this.loadEnrollments();
        await this.loadAvailableCourses();
        this.updateStats();
    }

    async checkAuth() {
        try {
            const response = await fetch('/tttn/backend/api/auth.php?action=check');
            const data = await response.json();
            
            if (!data.authenticated || data.user.role !== 'student') {
                return false;
            }

            this.user = data.user;
            document.getElementById('student-name').textContent = data.user.username;
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    bindEvents() {
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Browse courses
        document.getElementById('browse-courses-btn').addEventListener('click', () => {
            document.getElementById('available-courses').scrollIntoView({ behavior: 'smooth' });
        });

        // Edit profile
        document.getElementById('edit-profile-btn').addEventListener('click', () => this.showProfileModal());

        // Profile form
        document.getElementById('profile-form').addEventListener('submit', (e) => this.handleProfileSubmit(e));

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

        // Confirm enrollment
        const confirmBtn = document.getElementById('confirm-enroll-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmEnrollment());
        }


    }

    async loadProfile() {
        try {
            const response = await fetch('/tttn/backend/api/auth.php?action=profile');
            const data = await response.json();

            if (data.success) {
                const user = data.user;
                this.user = user;

                // Update profile display
                document.getElementById('profile-fullname').textContent = user.full_name;
                document.getElementById('profile-email').textContent = user.email;
                document.getElementById('profile-phone').textContent = user.phone || 'Chưa cập nhật';
                
                if (user.enrollment_date) {
                    const enrollmentDate = new Date(user.enrollment_date).toLocaleDateString('vi-VN');
                    document.getElementById('profile-enrollment').textContent = enrollmentDate;
                } else {
                    document.getElementById('profile-enrollment').textContent = 'Chưa đăng ký';
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    async loadEnrollments() {
        try {
            console.log('Loading enrollments...');
            const response = await fetch('/tttn/backend/api/enrollments_api.php?action=get_student_enrollments');
            const data = await response.json();
            
            console.log('Enrollments API Response:', data);

            if (data.success) {
                this.enrollments = data.enrollments;
                console.log('Enrollments loaded:', this.enrollments);
                this.renderMyCourses();
            } else {
                console.error('Error loading enrollments:', data.message);
                this.enrollments = [];
                this.renderMyCourses();
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
            this.enrollments = [];
            this.renderMyCourses();
        }
    }

    async loadAvailableCourses() {
        try {
            const response = await fetch('/tttn/backend/api/enrollments_api.php?action=get_available_courses');
            const data = await response.json();

            if (data.success) {
                this.availableCourses = data.courses;
                this.renderAvailableCourses();
            } else {
                console.error('Error loading available courses:', data.message);
                this.availableCourses = [];
                this.renderAvailableCourses();
            }
        } catch (error) {
            console.error('Error loading available courses:', error);
            this.availableCourses = [];
            this.renderAvailableCourses();
        }
    }

    renderMyCourses() {
        const container = document.getElementById('my-courses');
        container.innerHTML = '';

        console.log('Rendering enrollments:', this.enrollments);

        if (this.enrollments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-book text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">Bạn chưa đăng ký khóa học nào</p>
                    <button onclick="document.getElementById('browse-courses-btn').click()" class="btn-primary mt-4">
                        Xem khóa học có sẵn
                    </button>
                </div>
            `;
            return;
        }

        this.enrollments.forEach(enrollment => {
            console.log('Processing enrollment:', enrollment);
            const courseCard = document.createElement('div');
            courseCard.className = 'border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow';
            
            const progressColor = enrollment.progress_percentage >= 80 ? 'bg-green-500' : 
                                 enrollment.progress_percentage >= 50 ? 'bg-yellow-500' : 'bg-blue-500';

            const statusText = enrollment.status === 'active' ? 'Đang học' : 
                              enrollment.status === 'completed' ? 'Hoàn thành' : 'Đã hủy';
            const statusColor = enrollment.status === 'active' ? 'bg-green-100 text-green-800' : 
                               enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800';

            courseCard.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="text-xl font-bold text-gray-800">${enrollment.course_name}</h4>
                        <p class="text-gray-600">${enrollment.level}</p>
                    </div>
                    <span class="px-3 py-1 text-sm ${statusColor} rounded-full">
                        ${statusText}
                    </span>
                </div>
                
                <p class="text-gray-600 mb-4">${enrollment.description}</p>
                
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-700">Tiến độ học tập</span>
                        <span class="text-sm text-gray-600">${enrollment.progress_percentage}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="${progressColor} h-2 rounded-full transition-all duration-300" style="width: ${enrollment.progress_percentage}%"></div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Thời lượng:</span>
                        <div class="font-medium">${enrollment.duration}</div>
                    </div>
                    <div>
                        <span class="text-gray-500">Ngày đăng ký:</span>
                        <div class="font-medium">${new Date(enrollment.enrollment_date).toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>
                
                <div class="flex space-x-2 mt-4">
                    <button onclick="studentDashboard.continueLearning(${enrollment.course_id})" class="btn-primary flex-1">
                        <i class="fas fa-play mr-2"></i>
                        Tiếp tục học
                    </button>
                    ${enrollment.status === 'active' ? `
                        <button onclick="studentDashboard.dropCourse(${enrollment.id})" class="btn-secondary">
                            <i class="fas fa-times mr-2"></i>
                            Hủy khóa học
                        </button>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(courseCard);
        });
    }

    renderAvailableCourses() {
        const container = document.getElementById('available-courses');
        container.innerHTML = '';

        if (this.availableCourses.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-8">
                    <i class="fas fa-graduation-cap text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">Không có khóa học nào khác</p>
                </div>
            `;
            return;
        }

        this.availableCourses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow';
            
            courseCard.innerHTML = `
                <div class="mb-4">
                    <h4 class="text-lg font-bold text-gray-800 mb-2">${course.name}</h4>
                    <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">${course.level}</span>
                </div>
                
                <p class="text-gray-600 mb-4 text-sm">${course.description.substring(0, 100)}...</p>
                
                <div class="space-y-2 text-sm mb-4">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Thời lượng:</span>
                        <span class="font-medium">${course.duration}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Học phí:</span>
                        <span class="font-medium text-green-600">${new Intl.NumberFormat('vi-VN').format(course.price)} VNĐ</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Trình độ:</span>
                        <span class="font-medium">${course.level}</span>
                    </div>
                </div>
                
                <button class="enroll-btn btn-secondary w-full" data-course-id="${course.id}">
                    <i class="fas fa-plus mr-2"></i>
                    Đăng ký
                </button>
            `;
            
            container.appendChild(courseCard);
            
            // Add event listener to the enroll button
            const enrollBtn = courseCard.querySelector('.enroll-btn');
            enrollBtn.addEventListener('click', () => this.showEnrollModal(course.id));
        });
    }

    updateStats() {
        // Update enrolled courses count (only active enrollments)
        const activeEnrollments = this.enrollments.filter(e => e.status === 'active');
        document.getElementById('enrolled-courses').textContent = activeEnrollments.length;

        // Calculate average progress (only active enrollments)
        if (activeEnrollments.length > 0) {
            const totalProgress = activeEnrollments.reduce((sum, enrollment) => {
                // Ensure progress_percentage is a valid number
                const progress = parseFloat(enrollment.progress_percentage);
                return sum + (isNaN(progress) ? 0 : progress);
            }, 0);
            
            const avgProgress = totalProgress / activeEnrollments.length;
            const displayProgress = isNaN(avgProgress) ? 0 : Math.round(avgProgress);
            
            document.getElementById('avg-progress').textContent = displayProgress + '%';
            console.log('Progress calculation:', {
                activeEnrollments: activeEnrollments.length,
                totalProgress,
                avgProgress,
                displayProgress,
                enrollments: activeEnrollments.map(e => ({
                    course: e.course_name,
                    progress: e.progress_percentage,
                    parsed: parseFloat(e.progress_percentage)
                }))
            });
        } else {
            document.getElementById('avg-progress').textContent = '0%';
        }

        // Calculate days learning (from earliest enrollment date)
        if (this.enrollments.length > 0) {
            const enrollmentDates = this.enrollments
                .filter(e => e.enrollment_date)
                .map(e => new Date(e.enrollment_date));
            
            if (enrollmentDates.length > 0) {
                const earliestDate = new Date(Math.min(...enrollmentDates));
                const today = new Date();
                const diffTime = Math.abs(today - earliestDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                document.getElementById('days-learning').textContent = diffDays;
            } else {
                document.getElementById('days-learning').textContent = '0';
            }
        } else {
            document.getElementById('days-learning').textContent = '0';
        }
    }

    showEnrollModal(courseId) {
        const course = this.availableCourses.find(c => c.id === courseId);
        if (!course) {
            this.showNotification('Không tìm thấy thông tin khóa học!', 'error');
            return;
        }

        const modal = document.getElementById('enroll-modal');
        const detailsContainer = document.getElementById('course-details');
        
        detailsContainer.innerHTML = `
            <h4 class="text-lg font-bold text-gray-800 mb-2">${course.name}</h4>
            <p class="text-gray-600 mb-4">${course.description}</p>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">Thời lượng:</span>
                    <span class="font-medium">${course.duration}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Trình độ:</span>
                    <span class="font-medium">${course.level}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Học phí:</span>
                    <span class="font-medium text-green-600">${new Intl.NumberFormat('vi-VN').format(course.price)} VNĐ</span>
                </div>
            </div>
        `;
        
        // Store course ID for enrollment
        document.getElementById('confirm-enroll-btn').dataset.courseId = courseId;
        
        modal.classList.remove('hidden');
    }

    async confirmEnrollment() {
        const courseId = document.getElementById('confirm-enroll-btn').dataset.courseId;
        
        if (!courseId) {
            this.showNotification('Không tìm thấy thông tin khóa học. Vui lòng thử lại!', 'error');
            return;
        }

        // Get course info for better notification
        const course = this.availableCourses.find(c => c.id === parseInt(courseId));
        const courseName = course ? course.name : 'khóa học';

        this.showLoading(true);

        try {
            const response = await fetch('/tttn/backend/api/enrollments_api.php?action=enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    course_id: parseInt(courseId)
                })
            });

            const data = await response.json();

            if (data.success) {
                // Show enhanced success notification
                this.showNotification(`🎉 Đăng ký khóa học "${courseName}" thành công! Khóa học đã được thêm vào danh sách của bạn.`, 'success');
                this.closeModal('enroll-modal');
                
                // Reload data to show the new enrollment immediately
                await this.loadEnrollments();
                await this.loadAvailableCourses();
                this.updateStats();
                
                // Scroll to "My Courses" section to show the newly enrolled course
                setTimeout(() => {
                    const myCoursesSection = document.querySelector('#my-courses-container');
                    if (myCoursesSection) {
                        myCoursesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 500);
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
            this.showNotification('Có lỗi xảy ra khi đăng ký khóa học. Vui lòng thử lại!', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    continueLearning(courseId) {
        // In a real application, this would redirect to the learning platform
        this.showNotification('Chức năng học tập sẽ được phát triển trong tương lai!', 'info');
    }

    async dropCourse(enrollmentId) {
        if (!confirm('Bạn có chắc chắn muốn hủy đăng ký khóa học này?')) {
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/tttn/backend/api/enrollments_api.php?action=drop_course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    enrollment_id: enrollmentId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message, 'success');
                
                // Reload data
                await this.loadEnrollments();
                await this.loadAvailableCourses();
                this.updateStats();
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error dropping course:', error);
            this.showNotification('Có lỗi xảy ra khi hủy đăng ký khóa học', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showProfileModal() {
        const modal = document.getElementById('profile-modal');
        
        // Pre-fill form with current data
        document.getElementById('edit-fullname').value = this.user.full_name;
        document.getElementById('edit-phone').value = this.user.phone || '';
        document.getElementById('edit-password').value = '';
        document.getElementById('edit-confirm-password').value = '';
        
        modal.classList.remove('hidden');
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('edit-fullname').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        const password = document.getElementById('edit-password').value;
        const confirmPassword = document.getElementById('edit-confirm-password').value;

        if (!fullName) {
            this.showNotification('Họ tên là bắt buộc', 'error');
            return;
        }

        if (password && password !== confirmPassword) {
            this.showNotification('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        if (password && password.length < 6) {
            this.showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const updateData = {
                full_name: fullName,
                phone: phone
            };

            if (password) {
                updateData.password = password;
            }

            const response = await fetch(`/tttn/backend/api/users.php?id=${this.user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Cập nhật thông tin thành công!', 'success');
                this.closeModal('profile-modal');
                await this.loadProfile();
            } else {
                this.showNotification(data.error, 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Có lỗi xảy ra khi cập nhật thông tin', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
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

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 max-w-md ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2 mt-1 flex-shrink-0"></i>
                <span class="text-sm leading-relaxed">${message}</span>
                <button class="ml-2 text-white hover:text-gray-200 flex-shrink-0" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after longer time for success messages (7 seconds), shorter for others (5 seconds)
        const displayTime = type === 'success' ? 7000 : 5000;
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, displayTime);
    }
}

// Global functions
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
};

// Initialize dashboard
let studentDashboard;
document.addEventListener('DOMContentLoaded', function() {
    studentDashboard = new StudentDashboard();
    // Make it globally accessible
    window.studentDashboard = studentDashboard;
});