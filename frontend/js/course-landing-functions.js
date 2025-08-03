// Additional functions for Course Landing Page

// Load course teachers tab
function loadCourseTeachers(course) {
    const container = document.getElementById('course-teachers-content');
    const courseTeachers = teachers.filter(teacher => teacher.courses.includes(course.id));
    
    container.innerHTML = `
        <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-chalkboard-teacher text-green-500 mr-2"></i>
                Đội ngũ giảng viên
            </h3>
            <div class="grid md:grid-cols-2 gap-6">
                ${courseTeachers.map(teacher => `
                    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div class="flex items-center mb-4">
                            <div class="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                                ${teacher.name.charAt(0)}
                            </div>
                            <div>
                                <h4 class="text-xl font-bold text-gray-800">${teacher.nameVi}</h4>
                                <p class="text-gray-600">${teacher.title}</p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-clock text-blue-500 mr-2"></i>
                                <span>Kinh nghiệm: ${teacher.experience}</span>
                            </div>
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-star text-yellow-500 mr-2"></i>
                                <span>Chuyên môn: ${teacher.specialization}</span>
                            </div>
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-graduation-cap text-purple-500 mr-2"></i>
                                <span>${teacher.education}</span>
                            </div>
                        </div>
                        <p class="text-gray-700 mt-4 text-sm">${teacher.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Load course schedule tab
function loadCourseSchedule(course) {
    const container = document.getElementById('course-schedule-content');
    container.innerHTML = `
        <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-calendar-alt text-indigo-500 mr-2"></i>
                Lịch học và thời khóa biểu
            </h3>
            <div class="grid md:grid-cols-2 gap-8">
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                    <h4 class="text-xl font-bold text-gray-800 mb-4">Thông tin lịch học</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="font-semibold text-gray-600">Lịch học:</span>
                            <span class="text-gray-800">${course.schedule}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold text-gray-600">Ngày khai giảng:</span>
                            <span class="text-gray-800">${new Date(course.startDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold text-gray-600">Thời gian học:</span>
                            <span class="text-gray-800">${course.duration}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold text-gray-600">Sĩ số lớp:</span>
                            <span class="text-gray-800">Tối đa ${course.maxStudents} học viên</span>
                        </div>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                    <h4 class="text-xl font-bold text-gray-800 mb-4">Lịch thi và kiểm tra</h4>
                    <div class="space-y-3">
                        <div class="flex items-center">
                            <i class="fas fa-clipboard-check text-green-500 mr-3"></i>
                            <span class="text-gray-700">Kiểm tra giữa kỳ: Tuần 12</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-clipboard-check text-green-500 mr-3"></i>
                            <span class="text-gray-700">Thi cuối kỳ: Tuần 24</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-certificate text-yellow-500 mr-3"></i>
                            <span class="text-gray-700">Thi JLPT: Tháng 7 & 12</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load course reviews tab
function loadCourseReviews(course) {
    const container = document.getElementById('course-reviews-content');
    const courseReviews = testimonials.filter(t => t.course.includes(course.level));
    
    container.innerHTML = `
        <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-star text-yellow-500 mr-2"></i>
                Đánh giá từ học viên
            </h3>
            <div class="grid gap-6">
                ${courseReviews.map(review => `
                    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                ${review.name.charAt(0)}
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800">${review.name}</h4>
                                <div class="flex items-center">
                                    ${Array(review.rating).fill().map(() => '<i class="fas fa-star text-yellow-400"></i>').join('')}
                                    <span class="text-gray-600 ml-2 text-sm">${new Date(review.date).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>
                        <p class="text-gray-700 mb-3">"${review.comment}"</p>
                        <div class="bg-green-50 p-3 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-trophy text-green-500 mr-2"></i>
                                <span class="text-green-700 font-semibold">Thành tích: ${review.achievement}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Render course comparison table
function renderCourseComparison() {
    const tbody = document.getElementById('comparison-table-body');
    if (!tbody) return;
    
    const features = [
        { name: 'Thời gian học', n5: '6 tháng', n4n3: '8 tháng', n2n1: '12 tháng' },
        { name: 'Số từ vựng', n5: '800+ từ', n4n3: '1500+ từ', n2n1: '3000+ từ' },
        { name: 'Ngữ pháp', n5: 'Cơ bản N5', n4n3: 'N4-N3', n2n1: 'N2-N1' },
        { name: 'Kỹ năng đặc biệt', n5: 'Giao tiếp hàng ngày', n4n3: 'Luyện thi JLPT', n2n1: 'Viết luận văn' },
        { name: 'Phù hợp cho', n5: 'Người mới bắt đầu', n4n3: 'Có nền tảng N5', n2n1: 'Du học/Làm việc' },
        { name: 'Học phí', n5: '5.000.000₫', n4n3: '7.000.000₫', n2n1: '10.000.000₫' }
    ];
    
    tbody.innerHTML = features.map(feature => `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="p-4 font-semibold text-gray-700">${feature.name}</td>
            <td class="p-4 text-center text-gray-600">${feature.n5}</td>
            <td class="p-4 text-center text-gray-600">${feature.n4n3}</td>
            <td class="p-4 text-center text-gray-600">${feature.n2n1}</td>
        </tr>
    `).join('');
}

// Render testimonials
function renderTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;
    
    container.innerHTML = testimonials.map(testimonial => `
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:transform hover:scale-105 transition-all duration-300">
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    ${testimonial.name.charAt(0)}
                </div>
                <div>
                    <h4 class="font-bold text-gray-800">${testimonial.name}</h4>
                    <p class="text-gray-600 text-sm">${testimonial.course}</p>
                </div>
            </div>
            <div class="flex mb-3">
                ${Array(testimonial.rating).fill().map(() => '<i class="fas fa-star text-yellow-400"></i>').join('')}
            </div>
            <p class="text-gray-700 mb-4 italic">"${testimonial.comment}"</p>
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-trophy text-green-500 mr-2"></i>
                    <span class="text-green-700 font-semibold text-sm">${testimonial.achievement}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Tab switching functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

// Handle enrollment CTA
function initializeEnrollmentCTA() {
    const enrollBtn = document.getElementById('enroll-now-btn');
    const contactBtn = document.getElementById('contact-advisor-btn');
    
    if (enrollBtn) {
        enrollBtn.addEventListener('click', () => {
            if (selectedCourse) {
                // Redirect to student dashboard for enrollment
                window.location.href = 'auth.html?action=register';
            } else {
                alert('Vui lòng chọn một khóa học trước!');
            }
        });
    }
    
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            // Open contact modal or redirect to contact page
            window.location.href = 'tel:+84-123-456-789';
        });
    }
}