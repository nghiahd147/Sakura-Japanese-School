class AdminDashboard {
    constructor() {
        this.currentTab = 'dashboard';
        this.sidebarCollapsed = false;
        this.isLoggingOut = false;
        this.courses = [];
        this.init();
    }

    init() {
        console.log('Initializing AdminDashboard...');
        this.bindEvents();
        this.updateLastUpdatedTime();
        
        // Check auth first, then load data
        this.checkAuth().then(() => {
            this.loadDashboardData();
        });
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = e.target.dataset.modal || e.target.closest('.modal').id;
                this.closeModal(modalId);
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

        // Form submissions
        document.getElementById('user-form').addEventListener('submit', (e) => this.handleUserSubmit(e));
        document.getElementById('course-form').addEventListener('submit', (e) => this.handleCourseSubmit(e));
        document.getElementById('teacher-form').addEventListener('submit', (e) => this.handleTeacherSubmit(e));

        // Search and filters
        document.getElementById('user-search')?.addEventListener('input', 
            this.debounce(() => this.loadUsers(), 500));
        document.getElementById('user-role-filter')?.addEventListener('change', () => this.loadUsers());
        document.getElementById('user-status-filter')?.addEventListener('change', () => this.loadUsers());

        // Mobile responsive
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                document.getElementById('sidebar').classList.remove('mobile-open');
                document.querySelector('.sidebar-overlay')?.remove();
            }
        });
    }

    async checkAuth() {
        // Prevent redirect loop or check during logout
        if (window.location.href.includes('auth.html') || this.isLoggingOut) {
            return;
        }
        
        try {
            console.log('Checking auth...');
            const response = await fetch('/tttn/backend/api/auth.php?action=check');
            console.log('Auth response status:', response.status);
            
            if (!response.ok) {
                console.error('Auth check failed - HTTP status:', response.status);
                this.showAuthError('Server error. Please try again.');
                return;
            }
            
            const data = await response.json();
            console.log('Auth data:', data);
            
            if (!data.authenticated) {
                console.error('Auth check failed - not authenticated:', data);
                this.showAuthError('Please login first.');
                return;
            }
            
            if (!data.user || data.user.role !== 'admin') {
                console.error('Auth check failed - not admin role:', data.user?.role);
                this.showAuthError('Admin access required.');
                return;
            }
            
            console.log('Auth check successful for admin:', data.user.username);
            const adminNameEl = document.getElementById('admin-name');
            if (adminNameEl) {
                adminNameEl.textContent = data.user.full_name || data.user.username;
            }
            
        } catch (error) {
            console.error('Auth check exception:', error);
            this.showAuthError('Connection error. Please check your internet.');
        }
    }
    
    showAuthError(message) {
        // Show error message instead of immediate redirect
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="window.location.href='auth.html'" class="ml-4 bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700">
                    Go to Login
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 3000);
    }

    switchTab(tabName) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked nav item
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Show selected tab content
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }
        
        // Update page title
        const titles = {
            'dashboard': 'Tổng quan hệ thống',
            'users': 'Quản lý người dùng',
            'courses': 'Quản lý khóa học',
            'teachers': 'Quản lý giảng viên',
            'contact': 'Quản lý liên hệ'
        };
        
        document.getElementById('page-title').textContent = titles[tabName] || 'Dashboard';
        
        // Load data based on tab
        switch(tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'users':
                this.loadUsers(); // Thêm dòng này
                break;
            case 'courses':
                this.loadCourses();
                break;
            case 'teachers':
                this.loadTeachers();
                break;
            case 'contact':
                // Load contacts when contact tab is shown
                if (typeof loadContacts === 'function') {
                    loadContacts();
                    // Setup status filter
                    const statusFilter = document.getElementById('status-filter');
                    if (statusFilter) {
                        statusFilter.removeEventListener('change', filterContacts);
                        statusFilter.addEventListener('change', filterContacts);
                    }
                }
                break;
        }
        
        this.currentTab = tabName;
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const toggleIcon = document.querySelector('.sidebar-toggle-icon');

        if (window.innerWidth < 768) {
            // Mobile: show/hide sidebar
            sidebar.classList.toggle('mobile-open');
            
            if (sidebar.classList.contains('mobile-open')) {
                // Add overlay
                const overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.addEventListener('click', () => this.toggleSidebar());
                document.body.appendChild(overlay);
            } else {
                // Remove overlay
                document.querySelector('.sidebar-overlay')?.remove();
            }
        } else {
            // Desktop: collapse/expand sidebar
            this.sidebarCollapsed = !this.sidebarCollapsed;
            
            if (this.sidebarCollapsed) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
                toggleIcon.style.transform = 'rotate(180deg)';
            } else {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
                toggleIcon.style.transform = 'rotate(0deg)';
            }
        }
    }

    updateLastUpdatedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('last-updated-time').textContent = timeString;
    }

    async loadDashboardData() {
        try {
            this.showLoading();
            
            // Load stats
            const [users, courses, teachers] = await Promise.all([
                fetch('/tttn/backend/api/users.php').then(r => r.json()),
                fetch('/tttn/backend/api/courses_api.php').then(r => r.json()),
                fetch('/tttn/backend/api/teachers_api.php').then(r => r.json())
            ]);

            // Update stats
            document.getElementById('total-users').textContent = users.data?.length || 0;
            document.getElementById('total-courses').textContent = courses.data?.length || 0;
            document.getElementById('total-teachers').textContent = teachers.data?.length || 0;
            
            const activeStudents = users.data?.filter(u => u.role === 'student' && u.status === 'active').length || 0;
            document.getElementById('active-students').textContent = activeStudents;

            this.updateLastUpdatedTime();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            this.hideLoading();
        }
    }

    async loadUsers() {
        try {
            const search = document.getElementById('user-search')?.value || '';
            const roleFilter = document.getElementById('user-role-filter')?.value || '';
            const statusFilter = document.getElementById('user-status-filter')?.value || '';

            let url = '/tttn/backend/api/users.php';
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);
            if (statusFilter) params.append('status', statusFilter);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            console.log('Loading users from:', url); // Debug log

            const response = await fetch(url);
            const data = await response.json();

            console.log('Users response:', data); // Debug log

            if (data.success && data.data) {
                this.renderUsersTable(data.data);
            } else {
                console.error('Failed to load users:', data.error || 'Unknown error');
                // Hiển thị thông báo lỗi cho user
                this.showNotification('Không thể tải danh sách người dùng', 'error');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showNotification('Lỗi kết nối server', 'error');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) {
            console.error('Users table body not found');
            return;
        }

        console.log('Rendering users:', users); // Debug log

        if (!Array.isArray(users) || users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        Không có dữ liệu người dùng
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => {
            console.log('Processing user:', user); // Debug log cho từng user
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-gray-600"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${user.full_name || user.username || 'N/A'}</div>
                                <div class="text-sm text-gray-500">@${user.username || 'N/A'}</div>
                            </div>
                        </div>
                                    </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${user.email || 'N/A'}</div>
                    <div class="text-sm text-gray-500">${(user.phone === null || user.phone === 'null') ? 'Chưa cập nhật' : (user.phone || 'Chưa cập nhật')}</div>
                </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getRoleBadgeClass(user.role)}">
                            ${this.getRoleText(user.role)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusBadgeClass(user.status)}">
                            ${this.getStatusText(user.status)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '--'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 mr-3" onclick="adminDashboard.editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900" onclick="adminDashboard.deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getRoleBadgeClass(role) {
        const classes = {
            'admin': 'bg-purple-100 text-purple-800',
            'teacher': 'bg-blue-100 text-blue-800',
            'student': 'bg-green-100 text-green-800'
        };
        return classes[role] || 'bg-gray-100 text-gray-800';
    }

    getRoleText(role) {
        const texts = {
            'admin': 'Admin',
            'teacher': 'Giảng viên',
            'student': 'Học viên'
        };
        return texts[role] || role;
    }

    getStatusBadgeClass(status) {
        console.log('Status value:', status, 'Type:', typeof status); // Debug log
        
        const classes = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-red-100 text-red-800',
            'pending': 'bg-yellow-100 text-yellow-800'
        };
        
        // Xử lý trường hợp null, undefined hoặc empty string
        if (!status || status === 'null' || status === 'undefined') {
            return 'bg-gray-100 text-gray-800';
        }
        
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        console.log('Status text for:', status); // Debug log
        
        const texts = {
            'active': 'Hoạt động',
            'inactive': 'Tạm ngưng',
            'pending': 'Chờ duyệt'
        };
        
        // Xử lý trường hợp null, undefined hoặc empty string
        if (!status || status === 'null' || status === 'undefined') {
            return 'Chưa xác định';
        }
        
        return texts[status] || status;
    }

    async loadCourses() {
        try {
            const response = await fetch('/tttn/backend/api/courses_api.php');
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get response text first to debug
            const responseText = await response.text();
            console.log('Admin Load Courses API Response:', responseText);

            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response was:', responseText);
                throw new Error('Server trả về dữ liệu không hợp lệ');
            }

            if (data.success && data.data) {
                this.courses = data.data;
                this.renderCoursesGrid(data.data);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    }

    renderCoursesGrid(courses) {
        const grid = document.getElementById('courses-grid');
        if (!grid) return;

        grid.innerHTML = courses.map(course => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">${course.name}</h3>
                        <div class="flex space-x-2">
                            <button class="text-blue-600 hover:text-blue-800" onclick="adminDashboard.editCourse(${course.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-800" onclick="adminDashboard.deleteCourse(${course.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">${course.description}</p>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Thời lượng:</span>
                            <span class="font-medium">${course.duration}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Trình độ:</span>
                            <span class="font-medium">${course.level}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Học phí:</span>
                            <span class="font-medium text-green-600">${parseInt(course.price).toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Học viên:</span>
                            <span class="font-medium">${course.student_count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadTeachers() {
        try {
            const response = await fetch('/tttn/backend/api/teachers_api.php');
            const data = await response.json();

            if (data.success && data.data) {
                this.renderTeachersGrid(data.data);
            }
        } catch (error) {
            console.error('Error loading teachers:', error);
        }
    }

    renderTeachersGrid(teachers) {
        const grid = document.getElementById('teachers-grid');
        if (!grid) return;

        grid.innerHTML = teachers.map(teacher => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div class="p-6 text-center">
                    <div class="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                        ${(teacher.image_url && teacher.image_url.trim() !== '' && teacher.image_url !== 'null') || 
                          (teacher.image && teacher.image.trim() !== '' && teacher.image !== 'null') ? 
                            `<img src="${teacher.image_url || teacher.image}" alt="${teacher.name}" class="w-full h-full object-cover" 
                                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                             <div class="w-full h-full flex items-center justify-center bg-gray-100" style="display:none;">
                                <i class="fas fa-user text-gray-400 text-2xl"></i>
                             </div>` : 
                            `<div class="w-full h-full flex items-center justify-center bg-gray-100">
                                <i class="fas fa-user text-gray-400 text-2xl"></i>
                            </div>`
                        }
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">${teacher.name}</h3>
                    <p class="text-blue-600 text-sm font-medium mb-3">${teacher.position}</p>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">${teacher.description || 'Chưa có mô tả'}</p>
                    <div class="flex justify-center space-x-3">
                        <button class="text-blue-600 hover:text-blue-800" onclick="adminDashboard.editTeacher(${teacher.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" onclick="adminDashboard.deleteTeacher(${teacher.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Modal methods
    openUserModal(userId = null) {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('user-modal-title');
        const form = document.getElementById('user-form');
        
        console.log('Opening user modal for ID:', userId); // Debug log
        
        if (userId) {
            title.textContent = 'Chỉnh sửa người dùng';
            
            // Check if all form elements exist before loading data
            const requiredElements = ['user-id', 'user-username', 'user-email', 'user-fullname', 'user-phone', 'user-role', 'user-status', 'user-password'];
            let allElementsExist = true;
            
            requiredElements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (!element) {
                    console.error(`Missing form element: ${elementId}`);
                    allElementsExist = false;
                } else {
                    console.log(`Found form element: ${elementId}`, element);
                }
            });
            
            if (allElementsExist) {
                this.loadUserData(userId);
            } else {
                console.error('Some form elements are missing, cannot load user data');
                this.showNotification('Lỗi form: thiếu một số trường dữ liệu', 'error');
                return;
            }
        } else {
            title.textContent = 'Thêm người dùng mới';
            form.reset();
            document.getElementById('user-id').value = '';
            
            // Make password required for new users
            const passwordField = document.getElementById('user-password');
            const passwordLabel = passwordField.closest('div').querySelector('label');
            if (passwordLabel) {
                passwordLabel.classList.add('required');
                passwordLabel.textContent = 'Mật khẩu';
                passwordField.required = true;
                passwordField.placeholder = 'Nhập mật khẩu';
            }
        }
        
        modal.classList.remove('hidden');
    }

    openCourseModal(courseId = null) {
        const modal = document.getElementById('course-modal');
        const title = document.getElementById('course-modal-title');
        const form = document.getElementById('course-form');
        
        if (courseId) {
            title.textContent = 'Chỉnh sửa khóa học';
            this.loadCourseData(courseId);
        } else {
            title.textContent = 'Tạo khóa học mới';
            form.reset();
            document.getElementById('course-id').value = '';
        }
        
        modal.classList.remove('hidden');
    }

    openTeacherModal(teacherId = null) {
        const modal = document.getElementById('teacher-modal');
        const title = document.getElementById('teacher-modal-title');
        const form = document.getElementById('teacher-form');
        
        if (teacherId) {
            title.textContent = 'Chỉnh sửa giảng viên';
            this.loadTeacherData(teacherId);
        } else {
            title.textContent = 'Thêm giảng viên mới';
            form.reset();
            document.getElementById('teacher-id').value = '';
            
            // Clear image preview and related fields for new teacher
            this.clearTeacherImagePreview();
        }
        
        modal.classList.remove('hidden');
    }

    // Helper method to clear image preview
    clearTeacherImagePreview() {
        // Clear file input
        const fileInput = document.getElementById('teacher-image-file');
        if (fileInput) fileInput.value = '';
        
        // Clear hidden URL field
        const urlField = document.getElementById('teacher-image-url');
        if (urlField) urlField.value = '';
        
        // Hide preview
        const preview = document.getElementById('teacher-image-preview');
        if (preview) preview.classList.add('hidden');
        
        // Clear preview image src
        const previewImg = document.getElementById('teacher-preview-img');
        if (previewImg) previewImg.src = '';
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        
        // Clear specific modal data when closing
        if (modalId === 'teacher-modal') {
            this.clearTeacherImagePreview();
        }
    }

    // Edit methods
    editUser(userId) {
        this.openUserModal(userId);
    }

    editCourse(courseId) {
        this.openCourseModal(courseId);
    }

    editTeacher(teacherId) {
        this.openTeacherModal(teacherId);
    }

    // Delete methods
    async deleteUser(userId) {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
        
        try {
            const response = await fetch(`/tttn/backend/api/users.php?id=${userId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                this.loadUsers();
                this.showNotification('Đã xóa người dùng thành công', 'success');
            } else {
                this.showNotification(data.message || 'Lỗi khi xóa người dùng', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification('Lỗi khi xóa người dùng', 'error');
        }
    }

    async deleteCourse(courseId) {
        if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
        
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
            console.log('Admin Delete Course API Response:', responseText);

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
                this.loadCourses();
                this.showNotification('Đã xóa khóa học thành công', 'success');
            } else {
                this.showNotification(data.message || 'Lỗi khi xóa khóa học', 'error');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showNotification('Lỗi khi xóa khóa học', 'error');
        }
    }

    async deleteTeacher(teacherId) {
        if (!confirm('Bạn có chắc chắn muốn xóa giảng viên này?')) return;
        
        try {
            const response = await fetch(`/tttn/backend/api/teachers_api.php?id=${teacherId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                this.loadTeachers();
                this.showNotification('Đã xóa giảng viên thành công', 'success');
            } else {
                this.showNotification(data.message || 'Lỗi khi xóa giảng viên', 'error');
            }
        } catch (error) {
            console.error('Error deleting teacher:', error);
            this.showNotification('Lỗi khi xóa giảng viên', 'error');
        }
    }

    // Form submission methods
    async handleUserSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userId = document.getElementById('user-id').value;
        const userData = {
            username: formData.get('username') || document.getElementById('user-username').value,
            email: formData.get('email') || document.getElementById('user-email').value,
            full_name: formData.get('full_name') || document.getElementById('user-fullname').value,
            phone: formData.get('phone') || document.getElementById('user-phone').value,
            role: formData.get('role') || document.getElementById('user-role').value,
            status: formData.get('status') || document.getElementById('user-status').value
        };

        const password = document.getElementById('user-password').value;
        if (password) {
            userData.password = password;
        }

        this.showLoading();

        try {
            const url = userId ? `/tttn/backend/api/users.php?id=${userId}` : '/tttn/backend/api/users.php';
            const method = userId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message || 'Thành công!', 'success');
                this.closeModal('user-modal');
                this.loadUsers();
                this.loadDashboardData();
            } else {
                this.showNotification(data.error || 'Có lỗi xảy ra', 'error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            this.showNotification('Có lỗi xảy ra khi lưu người dùng', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleCourseSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const courseId = document.getElementById('course-id').value;
        const courseData = {
            name: document.getElementById('course-name').value,
            description: document.getElementById('course-description').value,
            duration: document.getElementById('course-duration').value,
            level: document.getElementById('course-level').value,
            price: document.getElementById('course-price').value
        };

        this.showLoading();

        try {
            // Add ID for update
            if (courseId) {
                courseData.id = parseInt(courseId);
            }

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
            console.log('Admin Course API Response:', responseText);

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
                this.showNotification(data.message || 'Thành công!', 'success');
                this.closeModal('course-modal');
                this.loadCourses();
                this.loadDashboardData();
            } else {
                this.showNotification(data.error || 'Có lỗi xảy ra', 'error');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            this.showNotification('Có lỗi xảy ra khi lưu khóa học', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleTeacherSubmit(e) {
        e.preventDefault();
        
        const teacherId = document.getElementById('teacher-id').value;
        let imageUrl = document.getElementById('teacher-image-url').value;
        
        // Check if user selected a new image file
        const imageFile = document.getElementById('teacher-image-file').files[0];
        
        this.showLoading();

        try {
            // If there's a new image file, upload it first
            if (imageFile) {
                const uploadResult = await this.uploadTeacherImage(imageFile);
                if (uploadResult.success) {
                    imageUrl = uploadResult.image_url;
                } else {
                    this.showNotification('Lỗi upload ảnh: ' + uploadResult.error, 'error');
                    this.hideLoading();
                    return;
                }
            }
            
            const teacherData = {
                name: document.getElementById('teacher-name').value,
                position: document.getElementById('teacher-position').value,
                description: document.getElementById('teacher-description').value,
                image_url: imageUrl
            };

            const url = teacherId ? `/tttn/backend/api/teachers_api.php?id=${teacherId}` : '/tttn/backend/api/teachers_api.php';
            const method = teacherId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teacherData)
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message || 'Thành công!', 'success');
                this.closeModal('teacher-modal');
                this.loadTeachers();
                this.loadDashboardData();
            } else {
                this.showNotification(data.error || 'Có lỗi xảy ra', 'error');
            }
        } catch (error) {
            console.error('Error saving teacher:', error);
            this.showNotification('Có lỗi xảy ra khi lưu giảng viên', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // New method to upload teacher image
    async uploadTeacherImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/tttn/backend/api/upload_image.php', {
                method: 'POST',
                body: formData
            });

            return await response.json();
        } catch (error) {
            console.error('Error uploading image:', error);
            return { success: false, error: 'Lỗi upload ảnh' };
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

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async logout() {
        if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) return;
        
        this.isLoggingOut = true;
        this.showLoading();
        
        try {
            console.log('Logging out...');
            const response = await fetch('/tttn/backend/api/auth.php?action=logout', { 
                method: 'POST',
                credentials: 'same-origin'
            });
            
            let data;
            try {
                data = await response.json();
                console.log('Logout response:', data);
            } catch (parseError) {
                console.error('Failed to parse logout response:', parseError);
                data = { success: response.ok };
            }
            
            if (response.ok && data.success) {
                console.log('Logout successful, redirecting...');
                this.showNotification('Đăng xuất thành công!', 'success');
                
                localStorage.setItem('justLoggedOut', 'true');
                
                sessionStorage.clear();
                
                setTimeout(() => {
                    window.location.replace('auth.html?logout=true');
                }, 1000);
            } else {
                console.error('Logout failed:', data);
                console.log('Logout API failed but redirecting anyway for security');
                this.showNotification('Đang đăng xuất...', 'info');
                
                localStorage.setItem('justLoggedOut', 'true');
                setTimeout(() => {
                    window.location.replace('auth.html?logout=true');
                }, 1000);
            }
        } catch (error) {
            console.error('Logout exception:', error);
            console.log('Logout exception but redirecting anyway for security');
            this.showNotification('Đang đăng xuất...', 'info');
            
            localStorage.setItem('justLoggedOut', 'true');
            setTimeout(() => {
                window.location.replace('auth.html?logout=true');
            }, 1000);
        } finally {
            this.hideLoading();
        }
    }

    // Load data methods
    async loadUserData(userId) {
        try {
            console.log('Loading user data for ID:', userId); // Debug log
            
            const response = await fetch(`/tttn/backend/api/users.php?id=${userId}`);
            const data = await response.json();
            
            console.log('User data response:', data); // Debug log

            if (data.success && data.data) {
                const user = data.data;
                console.log('Populating form with user:', user); // Debug log
                console.log('Phone value:', user.phone, 'Type:', typeof user.phone); // Debug phone specifically
                console.log('Status value:', user.status, 'Type:', typeof user.status); // Debug status specifically
                
                // Populate form fields with detailed logging and proper null handling
                const fields = [
                    { id: 'user-id', value: user.id || '', name: 'ID' },
                    { id: 'user-username', value: user.username || '', name: 'Username' },
                    { id: 'user-email', value: user.email || '', name: 'Email' },
                    { id: 'user-fullname', value: user.full_name || '', name: 'Full Name' },
                    { id: 'user-phone', value: (user.phone === null || user.phone === 'null') ? '' : (user.phone || ''), name: 'Phone' },
                    { id: 'user-role', value: user.role || '', name: 'Role' },
                    { id: 'user-status', value: user.status || 'pending', name: 'Status' }
                ];
                
                fields.forEach(field => {
                    const element = document.getElementById(field.id);
                    if (element) {
                        element.value = field.value;
                        console.log(`Set ${field.name}:`, field.value, 'Element value:', element.value);
                    } else {
                        console.error(`Element not found: ${field.id}`);
                    }
                });
                
                // Clear password field and make it optional for editing
                const passwordField = document.getElementById('user-password');
                if (passwordField) {
                    passwordField.value = '';
                    passwordField.placeholder = 'Để trống nếu không muốn thay đổi mật khẩu';
                    passwordField.required = false;
                    
                    // Update label to indicate optional
                    const passwordLabel = passwordField.closest('div').querySelector('label');
                    if (passwordLabel) {
                        passwordLabel.classList.remove('required');
                        passwordLabel.textContent = 'Mật khẩu (tùy chọn)';
                    }
                }
                
                // Log final form state
                console.log('Form populated successfully');
                console.log('Phone field final value:', document.getElementById('user-phone').value);
                console.log('Status field final value:', document.getElementById('user-status').value);
                
            } else {
                console.error('Failed to load user data:', data);
                this.showNotification('Không thể tải thông tin người dùng', 'error');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showNotification('Lỗi khi tải thông tin người dùng', 'error');
        }
    }

    loadCourseData(courseId) {
        // Find course in loaded data
        const course = this.courses.find(c => c.id == courseId);
        if (course) {
            document.getElementById('course-id').value = course.id;
            document.getElementById('course-name').value = course.name;
            document.getElementById('course-description').value = course.description;
            document.getElementById('course-duration').value = course.duration;
            document.getElementById('course-level').value = course.level;
            document.getElementById('course-price').value = course.price;
        } else {
            this.showNotification('Không tìm thấy thông tin khóa học', 'error');
        }
    }

    async loadTeacherData(teacherId) {
        try {
            const response = await fetch(`/tttn/backend/api/teachers_api.php?id=${teacherId}`);
            const data = await response.json();

            if (data.success && data.data) {
                const teacher = data.data;
                document.getElementById('teacher-id').value = teacher.id;
                document.getElementById('teacher-name').value = teacher.name;
                document.getElementById('teacher-position').value = teacher.position;
                document.getElementById('teacher-description').value = teacher.description || '';
                
                // Handle existing image
                const imageUrl = teacher.image_url || teacher.image || '';
                document.getElementById('teacher-image-url').value = imageUrl;
                
                // Clear file input for editing
                document.getElementById('teacher-image-file').value = '';
                
                // Show existing image preview if available
                if (imageUrl) {
                    const preview = document.getElementById('teacher-image-preview');
                    const img = document.getElementById('teacher-preview-img');
                    
                    img.src = imageUrl;
                    preview.classList.remove('hidden');
                } else {
                    document.getElementById('teacher-image-preview').classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error loading teacher data:', error);
            this.showNotification('Lỗi khi tải thông tin giảng viên', 'error');
        }
    }
}

// Global functions for image preview and removal
function previewTeacherImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File quá lớn! Kích thước tối đa là 5MB.');
            input.value = '';
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Định dạng file không hỗ trợ! Chỉ chấp nhận: JPG, PNG, GIF.');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('teacher-image-preview');
            const img = document.getElementById('teacher-preview-img');
            
            img.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removeTeacherImage() {
    // Use the adminDashboard method for consistency
    if (window.adminDashboard && window.adminDashboard.clearTeacherImagePreview) {
        window.adminDashboard.clearTeacherImagePreview();
    } else {
        // Fallback if adminDashboard not available
        document.getElementById('teacher-image-file').value = '';
        document.getElementById('teacher-image-url').value = '';
        document.getElementById('teacher-image-preview').classList.add('hidden');
        document.getElementById('teacher-preview-img').src = '';
    }
}

// Initialize dashboard
const adminDashboard = new AdminDashboard();

// Make it globally available
window.adminDashboard = adminDashboard;

// Contact Management Functions
let contacts = [];
let currentContact = null;

// Load contacts from API
async function loadContacts() {
    try {
        console.log('🔍 Loading contacts...');
        
        const response = await fetch('/tttn/backend/api/contact_api.php');
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Contacts data received:', data);
        
        if (data.success && data.data) {
            contacts = data.data;
            console.log('✅ Loaded', contacts.length, 'contacts');
            updateContactStats();
            renderContactsTable();
        } else {
            console.warn('⚠️ No contacts data found');
            showNoContactsMessage();
        }
    } catch (error) {
        console.error('❌ Contacts loading failed:', error);
        showContactErrorMessage(error);
    }
}

// Update contact statistics
function updateContactStats() {
    const total = contacts.length;
    const newCount = contacts.filter(c => c.status === 'new').length;
    const processedCount = contacts.filter(c => c.status === 'processed').length;
    const completedCount = contacts.filter(c => c.status === 'completed').length;
    
    document.getElementById('total-contacts').textContent = total;
    document.getElementById('new-contacts').textContent = newCount;
    document.getElementById('processed-contacts').textContent = processedCount;
    document.getElementById('completed-contacts').textContent = completedCount;
}

// Render contacts table
function renderContactsTable() {
    const tbody = document.getElementById('contacts-table-body');
    
    if (!contacts || contacts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    <i class="fas fa-inbox text-2xl mb-4"></i>
                    <p>Chưa có liên hệ nào</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = contacts.map(contact => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${contact.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${contact.first_name} ${contact.last_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${contact.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${contact.country_code} ${contact.phone}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${contact.course_name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getContactStatusBadgeClass(contact.status)}">
                    ${getContactStatusText(contact.status)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(contact.created_at)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewContact(${contact.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="processContact(${contact.id})" class="text-green-600 hover:text-green-900 mr-3">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="deleteContact(${contact.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Filter contacts by status
function filterContacts() {
    const statusFilter = document.getElementById('status-filter').value;
    const tbody = document.getElementById('contacts-table-body');
    
    let filteredContacts = contacts;
    if (statusFilter) {
        filteredContacts = contacts.filter(c => c.status === statusFilter);
    }
    
    if (filteredContacts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    <i class="fas fa-filter text-2xl mb-4"></i>
                    <p>Không có liên hệ nào với trạng thái này</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredContacts.map(contact => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${contact.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${contact.first_name} ${contact.last_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${contact.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${contact.country_code} ${contact.phone}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${contact.course_name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getContactStatusBadgeClass(contact.status)}">
                    ${getContactStatusText(contact.status)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(contact.created_at)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewContact(${contact.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="processContact(${contact.id})" class="text-green-600 hover:text-green-900 mr-3">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="deleteContact(${contact.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Show no contacts message
function showNoContactsMessage() {
    const tbody = document.getElementById('contacts-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                <i class="fas fa-inbox text-2xl mb-4"></i>
                <p>Chưa có liên hệ nào</p>
            </td>
        </tr>
    `;
}

// Show error message
function showContactErrorMessage(error) {
    const tbody = document.getElementById('contacts-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="px-6 py-4 text-center text-red-500">
                <i class="fas fa-exclamation-triangle text-2xl mb-4"></i>
                <p>Không thể tải dữ liệu liên hệ</p>
                <p class="text-sm mt-2 opacity-70">Lỗi: ${error.message}</p>
                <button onclick="loadContacts()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="fas fa-redo mr-2"></i>Thử lại
                </button>
            </td>
        </tr>
    `;
}

// View contact details
function viewContact(contactId) {
    const contact = contacts.find(c => c.id == contactId);
    if (!contact) {
        alert('Không tìm thấy thông tin liên hệ');
        return;
    }
    
    currentContact = contact;
    
    const detailsContainer = document.getElementById('contact-details');
    detailsContainer.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-900 mb-3">Thông tin cá nhân</h4>
            <p class="text-sm text-gray-600 mb-1"><strong>Họ tên:</strong> ${contact.first_name} ${contact.last_name}</p>
            <p class="text-sm text-gray-600 mb-1"><strong>Email:</strong> ${contact.email}</p>
            <p class="text-sm text-gray-600 mb-1"><strong>Số điện thoại:</strong> ${contact.country_code} ${contact.phone}</p>
            <p class="text-sm text-gray-600 mb-1"><strong>Quốc tịch:</strong> ${contact.nationality}</p>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-900 mb-3">Thông tin khóa học</h4>
            <p class="text-sm text-gray-600 mb-1"><strong>Khóa học quan tâm:</strong> ${contact.course_name || 'N/A'}</p>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-900 mb-3">Tin nhắn</h4>
            <p class="text-sm text-gray-600">${contact.message}</p>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-900 mb-3">Thông tin hệ thống</h4>
            <p class="text-sm text-gray-600 mb-1"><strong>Trạng thái:</strong> 
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getContactStatusBadgeClass(contact.status)}">
                    ${getContactStatusText(contact.status)}
                </span>
            </p>
            <p class="text-sm text-gray-600 mb-1"><strong>Ngày tạo:</strong> ${formatDate(contact.created_at)}</p>
            <p class="text-sm text-gray-600 mb-1"><strong>Cập nhật lần cuối:</strong> ${formatDate(contact.updated_at)}</p>
        </div>
    `;
    
    // Show modal
    const modal = document.getElementById('contact-modal');
    modal.classList.remove('hidden');
}

// Process contact
async function processContact(contactId) {
    if (!contactId && currentContact) {
        contactId = currentContact.id;
    }
    
    if (!contactId) {
        alert('Vui lòng chọn liên hệ để xử lý');
        return;
    }
    
    if (confirm('Bạn có chắc muốn chuyển trạng thái liên hệ này sang "Đang xử lý"?')) {
        try {
            const contact = contacts.find(c => c.id == contactId);
            if (contact) {
                contact.status = 'processed';
                contact.updated_at = new Date().toISOString();
                
                renderContactsTable();
                updateContactStats();
                
                alert('Đã cập nhật trạng thái thành công!');
                
                if (currentContact && currentContact.id == contactId) {
                    adminDashboard.closeModal('contact-modal');
                }
            }
        } catch (error) {
            console.error('Error processing contact:', error);
            alert('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    }
}

// Complete contact
async function completeContact(contactId) {
    if (!contactId && currentContact) {
        contactId = currentContact.id;
    }
    
    if (!contactId) {
        alert('Vui lòng chọn liên hệ để hoàn thành');
        return;
    }
    
    if (confirm('Bạn có chắc muốn chuyển trạng thái liên hệ này sang "Hoàn thành"?')) {
        try {
            const contact = contacts.find(c => c.id == contactId);
            if (contact) {
                contact.status = 'completed';
                contact.updated_at = new Date().toISOString();
                
                renderContactsTable();
                updateContactStats();
                
                alert('Đã hoàn thành xử lý liên hệ!');
                
                if (currentContact && currentContact.id == contactId) {
                    adminDashboard.closeModal('contact-modal');
                }
            }
        } catch (error) {
            console.error('Error completing contact:', error);
            alert('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    }
}

// Delete contact
async function deleteContact(contactId) {
    if (!contactId && currentContact) {
        contactId = currentContact.id;
    }
    
    if (!contactId) {
        alert('Vui lòng chọn liên hệ để xóa');
        return;
    }
    
    if (confirm('Bạn có chắc muốn xóa liên hệ này? Hành động này không thể hoàn tác.')) {
        try {
            contacts = contacts.filter(c => c.id != contactId);
            
            renderContactsTable();
            updateContactStats();
            
            alert('Đã xóa liên hệ thành công!');
            
            if (currentContact && currentContact.id == contactId) {
                adminDashboard.closeModal('contact-modal');
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Có lỗi xảy ra khi xóa liên hệ');
        }
    }
}

// Helper functions for contacts
function getContactStatusBadgeClass(status) {
    switch(status) {
        case 'new': return 'bg-blue-100 text-blue-800';
        case 'processed': return 'bg-green-100 text-green-800';
        case 'completed': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getContactStatusText(status) {
    switch(status) {
        case 'new': return 'Mới';
        case 'processed': return 'Đang xử lý';
        case 'completed': return 'Hoàn thành';
        default: return status;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize contact management when contact tab is shown
function initializeContactTab() {
    loadContacts();
    
    // Setup status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterContacts);
    }
}