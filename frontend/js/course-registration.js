// Course Landing Page JavaScript

let selectedCourse = null;
let courses = [];
let teachers = [];
let testimonials = [];

// Mock course data
const mockCourses = [
    {
        id: 1,
        name: 'Khóa học tiếng Nhật cơ bản (N5)',
        level: 'N5',
        duration: '6 tháng',
        price: 5000000,
        description: 'Khóa học dành cho người mới bắt đầu học tiếng Nhật',
        features: ['Học từ con số 0', 'Giáo viên bản ngữ', 'Tài liệu miễn phí', 'Hỗ trợ 24/7'],
        schedule: 'Thứ 2, 4, 6 - 19:00-21:00',
        startDate: '2024-09-01',
        maxStudents: 20,
        videoUrl: 'https://www.youtube.com/embed/J_EQDtpYSNM',
        videoTitle: 'Giới thiệu khóa học tiếng Nhật N5',
        videoDuration: '13:58s'
    },
    {
        id: 2,
        name: 'Khóa học tiếng Nhật trung cấp (N4-N3)',
        level: 'N4-N3',
        duration: '8 tháng',
        price: 7000000,
        description: 'Nâng cao kỹ năng tiếng Nhật từ N4 lên N3',
        features: ['Luyện thi JLPT', 'Thực hành giao tiếp', 'Văn hóa Nhật Bản', 'Mock test hàng tuần'],
        schedule: 'Thứ 3, 5, 7 - 19:00-21:00',
        startDate: '2024-09-15',
        maxStudents: 15,
        videoUrl: 'https://www.youtube.com/embed/6p9Il_j0zjc',
        videoTitle: 'Giới thiệu khóa học tiếng Nhật N4-N3',
        videoDuration: '01:04:33'
    },
    {
        id: 3,
        name: 'Khóa học tiếng Nhật cao cấp (N2-N1)',
        level: 'N2-N1',
        duration: '12 tháng',
        price: 10000000,
        description: 'Chuẩn bị cho kỳ thi JLPT N1 và du học Nhật Bản',
        features: ['Luyện thi N1', 'Kỹ năng học thuật', 'Chuẩn bị du học', 'Mentor 1-1'],
        schedule: 'Thứ 2, 4, 6 - 18:00-20:00',
        startDate: '2024-10-01',
        maxStudents: 10,
        videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
        videoTitle: 'Giới thiệu khóa học tiếng Nhật N2-N1',
        videoDuration: '4:13'
    }
];

// Mock teachers data
const mockTeachers = [
    {
        id: 1,
        name: 'Tanaka Hiroshi',
        nameVi: 'Thầy Tanaka Hiroshi',
        title: 'Giáo viên chính',
        experience: '8 năm',
        specialization: 'Ngữ pháp N5-N3, Giao tiếp cơ bản',
        education: 'Thạc sĩ Ngôn ngữ học - Đại học Tokyo',
        image: 'img/teacher1.jpg',
        description: 'Thầy Tanaka có 8 năm kinh nghiệm giảng dạy tiếng Nhật cho người Việt Nam. Chuyên về ngữ pháp cơ bản và giao tiếp hàng ngày.',
        courses: [1, 2]
    },
    {
        id: 2,
        name: 'Yamada Yuki',
        nameVi: 'Cô Yamada Yuki',
        title: 'Giáo viên cao cấp',
        experience: '12 năm',
        specialization: 'JLPT N2-N1, Văn hóa Nhật Bản',
        education: 'Tiến sĩ Văn học Nhật Bản - Đại học Waseda',
        image: 'img/teacher2.jpg',
        description: 'Cô Yamada chuyên về giảng dạy trình độ cao cấp và chuẩn bị cho kỳ thi JLPT. Có kinh nghiệm hướng dẫn nhiều học viên đỗ N1.',
        courses: [2, 3]
    },
    {
        id: 3,
        name: 'Sato Kenji',
        nameVi: 'Thầy Sato Kenji',
        title: 'Giáo viên phát âm',
        experience: '6 năm',
        specialization: 'Phát âm, Nghe nói',
        education: 'Cử nhân Sư phạm - Đại học Kyoto',
        image: 'img/teacher3.jpg',
        description: 'Thầy Sato chuyên về phát âm và kỹ năng nghe nói. Giúp học viên có được giọng nói tự nhiên như người Nhật bản địa.',
        courses: [1, 2, 3]
    }
];

// Mock testimonials data
const mockTestimonials = [
    {
        id: 1,
        name: 'Nguyễn Thị Mai',
        course: 'Khóa học cơ bản (N5)',
        rating: 5,
        comment: 'Tôi đã học từ con số 0 và sau 6 tháng đã có thể giao tiếp cơ bản. Giáo viên rất tận tâm và phương pháp giảng dạy dễ hiểu.',
        achievement: 'Đỗ N5 với điểm A',
        image: 'img/student1.jpg',
        date: '2024-06-15'
    },
    {
        id: 2,
        name: 'Trần Văn Nam',
        course: 'Khóa học trung cấp (N4-N3)',
        rating: 5,
        comment: 'Khóa học giúp tôi nâng cao đáng kể kỹ năng tiếng Nhật. Đặc biệt phần luyện thi JLPT rất hiệu quả.',
        achievement: 'Đỗ N3 và đang học tại Nhật Bản',
        image: 'img/student2.jpg',
        date: '2024-07-20'
    },
    {
        id: 3,
        name: 'Lê Thị Hoa',
        course: 'Khóa học cao cấp (N2-N1)',
        rating: 5,
        comment: 'Nhờ khóa học này tôi đã đỗ N1 và nhận được học bổng du học tại Đại học Tokyo. Cảm ơn các thầy cô!',
        achievement: 'Đỗ N1 và nhận học bổng du học',
        image: 'img/student3.jpg',
        date: '2024-08-01'
    }
];

// Load courses (using mock data)
function loadCourses() {
    console.log('Loading courses with mock data...');
    courses = [...mockCourses];
    teachers = [...mockTeachers];
    testimonials = [...mockTestimonials];
    
    renderCourses();
    renderCourseComparison();
    renderTestimonials();
}

// Render courses
function renderCourses() {
    console.log('Rendering courses...');
    const container = document.getElementById('courses-container');
    if (!container) {
        console.error('courses-container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    courses.forEach((course, index) => {
        const courseCard = createCourseCard(course, index);
        container.appendChild(courseCard);
    });
}

// Create course card
function createCourseCard(course, index) {
    const card = document.createElement('div');
    card.className = 'course-registration-card';
    card.setAttribute('data-course', course.id);
    
    // Determine gradient colors based on level
    let gradientClass = '';
    let badgeClass = '';
    let iconClass = '';
    
    switch(course.level) {
        case 'N5':
            gradientClass = 'from-green-400 to-blue-500';
            badgeClass = 'bg-green-100 text-green-800';
            iconClass = 'fas fa-seedling';
            break;
        case 'N4-N3':
            gradientClass = 'from-purple-500 to-pink-500';
            badgeClass = 'bg-purple-100 text-purple-800';
            iconClass = 'fas fa-mountain';
            break;
        case 'N2-N1':
            gradientClass = 'from-orange-500 to-red-500';
            badgeClass = 'bg-orange-100 text-orange-800';
            iconClass = 'fas fa-crown';
            break;
        default:
            gradientClass = 'from-gray-400 to-gray-600';
            badgeClass = 'bg-gray-100 text-gray-800';
            iconClass = 'fas fa-book';
    }
    
    card.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 relative">
            ${index === 1 ? '<div class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">Phổ biến nhất</div>' : ''}
            <div class="bg-gradient-to-br ${gradientClass} p-8 text-white text-center relative">
                <div class="bg-white/20 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">${course.level}</div>
                <i class="${iconClass} text-4xl mb-4"></i>
                <h3 class="text-2xl font-bold mb-2">${course.name}</h3>
                <p class="text-white/90">${course.description}</p>
                <button class="video-preview-btn" onclick="showVideoPreview(${course.id})" title="Xem video giới thiệu">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="p-6">
                <div class="space-y-4 mb-6">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Thời gian:</span>
                        <span class="font-bold">${course.duration}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Học phí:</span>
                        <span class="font-bold text-blue-600">${new Intl.NumberFormat('vi-VN').format(course.price)} ₫</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Lịch học:</span>
                        <span class="font-bold text-sm">${course.schedule}</span>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-700 mb-3">Điểm nổi bật:</h4>
                    <ul class="space-y-2">
                        ${course.features.map(feature => `
                            <li class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                ${feature}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <button onclick="showCourseDetails(${course.id})" class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-bold hover:transform hover:scale-105 transition-all">
                    <i class="fas fa-info-circle mr-2"></i>Xem chi tiết
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Show course details
function showCourseDetails(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    selectedCourse = course;
    
    // Update course header
    const header = document.getElementById('course-detail-header');
    if (header) {
        // Determine gradient colors based on level
        let gradientClass = '';
        switch(course.level) {
            case 'N5':
                gradientClass = 'bg-gradient-to-br from-green-400 to-blue-500';
                break;
            case 'N4-N3':
                gradientClass = 'bg-gradient-to-br from-purple-500 to-pink-500';
                break;
            case 'N2-N1':
                gradientClass = 'bg-gradient-to-br from-orange-500 to-red-500';
                break;
            default:
                gradientClass = 'bg-gradient-to-br from-gray-400 to-gray-600';
        }
        
        header.className = `p-8 text-white ${gradientClass}`;
        header.innerHTML = `
            <div class="text-center">
                <div class="bg-white/20 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">${course.level}</div>
                <h2 class="text-4xl font-bold mb-2">${course.name}</h2>
                <p class="text-white/90 text-lg">${course.description}</p>
                <div class="flex justify-center items-center mt-4 space-x-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold">${course.duration}</div>
                        <div class="text-white/80">Thời gian</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold">${new Intl.NumberFormat('vi-VN').format(course.price)} ₫</div>
                        <div class="text-white/80">Học phí</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold">${course.maxStudents}</div>
                        <div class="text-white/80">Sĩ số</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Load tab contents
    loadCourseOverview(course);
    loadCourseCurriculum(course);
    loadCourseTeachers(course);
    loadCourseSchedule(course);
    loadCourseReviews(course);
    
    // Initialize tabs
    initializeStaticTabs();
    
    // Show and scroll to course details section
    const courseSection = document.getElementById('course-details-section');
    if (courseSection) {
        courseSection.classList.remove('hidden');
        courseSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Load course overview tab
function loadCourseOverview(course) {
    const container = document.getElementById('course-overview-content');
    const videoUrl = course.videoUrl || 'https://www.youtube.com/embed/J_EQDtpYSNM';
    const videoTitle = course.videoTitle || `Giới thiệu khóa học ${course.name}`;
    
    container.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-8">
            <div>
                <!-- Course Video Section -->
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mb-6">
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-play-circle text-blue-500 mr-2"></i>
                        Video giới thiệu khóa học
                    </h3>
                    <div class="aspect-video rounded-lg overflow-hidden mb-4">
                        <iframe 
                            class="w-full h-full"
                            src="${videoUrl}"
                            title="${videoTitle}"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="bg-white p-4 rounded-lg">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="text-lg font-bold text-gray-800 mb-2">${videoTitle}</h4>
                                <div class="flex items-center text-gray-600 mb-3">
                                    <i class="fas fa-clock mr-2"></i>
                                    <span>Thời lượng: ${course.videoDuration || '5:30'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white p-4 rounded-lg border border-gray-200">
                            <h5 class="font-semibold text-gray-700 mb-2">Nội dung video:</h5>
                            <ul class="text-sm text-gray-600 space-y-1">
                                <li>• Giới thiệu tổng quan khóa học</li>
                                <li>• Phương pháp giảng dạy</li>
                                <li>• Đội ngũ giảng viên</li>
                                <li>• Cơ sở vật chất</li>
                                <li>• Thành tích học viên</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-info-circle text-indigo-500 mr-2"></i>
                    Thông tin chi tiết
                </h3>
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-gray-600">Thời gian học:</span>
                            <span class="text-gray-800">${course.duration}</span>
                        </div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-gray-600">Lịch học:</span>
                            <span class="text-gray-800">${course.schedule}</span>
                        </div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-gray-600">Khai giảng:</span>
                            <span class="text-gray-800">${new Date(course.startDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-gray-600">Sĩ số tối đa:</span>
                            <span class="text-gray-800">${course.maxStudents} học viên</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load course curriculum tab
function loadCourseCurriculum(course) {
    const container = document.getElementById('course-curriculum-content');
    const curriculum = getCurriculumByLevel(course.level);
    
    container.innerHTML = `
        <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-book-open text-indigo-500 mr-2"></i>
                Chương trình giảng dạy
            </h3>
            <div class="grid gap-6">
                ${curriculum.map((module, index) => `
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500">
                        <h4 class="text-xl font-bold text-gray-800 mb-3">
                            <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm mr-3">${index + 1}</span>
                            ${module.title}
                        </h4>
                        <p class="text-gray-600 mb-4">${module.description}</p>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <h5 class="font-semibold text-gray-700 mb-2">Nội dung chính:</h5>
                                <ul class="space-y-1">
                                    ${module.topics.map(topic => `
                                        <li class="flex items-center text-sm text-gray-600">
                                            <i class="fas fa-check text-green-500 mr-2"></i>
                                            ${topic}
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div class="bg-white p-4 rounded-lg">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-gray-600">Thời lượng:</span>
                                    <span class="font-semibold">${module.duration}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Bài kiểm tra:</span>
                                    <span class="font-semibold">${module.hasTest ? 'Có' : 'Không'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Get curriculum by level
function getCurriculumByLevel(level) {
    const curriculums = {
        'N5': [
            {
                title: 'Hiragana và Katakana',
                description: 'Học bảng chữ cái Hiragana và Katakana cơ bản',
                duration: '4 tuần',
                hasTest: true,
                topics: ['46 ký tự Hiragana', '46 ký tự Katakana', 'Cách viết và đọc', 'Bài tập thực hành']
            },
            {
                title: 'Từ vựng cơ bản',
                description: 'Học 800 từ vựng thiết yếu cho N5',
                duration: '8 tuần',
                hasTest: true,
                topics: ['Số đếm', 'Thời gian', 'Gia đình', 'Đồ vật hàng ngày', 'Màu sắc', 'Thức ăn']
            },
            {
                title: 'Ngữ pháp N5',
                description: 'Các mẫu câu và ngữ pháp cơ bản',
                duration: '10 tuần',
                hasTest: true,
                topics: ['です/である', 'Thì hiện tại/quá khứ', 'Trợ từ は、が、を、に', 'Mẫu câu cơ bản']
            },
            {
                title: 'Giao tiếp hàng ngày',
                description: 'Luyện tập giao tiếp trong các tình huống thực tế',
                duration: '6 tuần',
                hasTest: false,
                topics: ['Chào hỏi', 'Mua sắm', 'Hỏi đường', 'Giới thiệu bản thân']
            }
        ],
        'N4-N3': [
            {
                title: 'Kanji trung cấp',
                description: 'Học 300 chữ Kanji thông dụng',
                duration: '8 tuần',
                hasTest: true,
                topics: ['Kanji N4 (168 chữ)', 'Kanji N3 (132 chữ)', 'Âm On và Kun', 'Từ ghép Kanji']
            },
            {
                title: 'Ngữ pháp N4-N3',
                description: 'Ngữ pháp phức tạp và mẫu câu nâng cao',
                duration: '12 tuần',
                hasTest: true,
                topics: ['Thể khả năng', 'Thể bị động', 'Thể sai khiến', 'Mẫu câu điều kiện']
            },
            {
                title: 'Đọc hiểu',
                description: 'Luyện đọc hiểu văn bản tiếng Nhật',
                duration: '6 tuần',
                hasTest: true,
                topics: ['Bài báo ngắn', 'Email', 'Thông báo', 'Truyện ngắn']
            },
            {
                title: 'Luyện thi JLPT',
                description: 'Chuẩn bị cho kỳ thi JLPT N3',
                duration: '6 tuần',
                hasTest: true,
                topics: ['Chiến lược làm bài', 'Đề thi thử', 'Phân tích đáp án', 'Quản lý thời gian']
            }
        ],
        'N2-N1': [
            {
                title: 'Kanji cao cấp',
                description: 'Học 1000+ chữ Kanji phức tạp',
                duration: '16 tuần',
                hasTest: true,
                topics: ['Kanji N2 (367 chữ)', 'Kanji N1 (633 chữ)', 'Từ đồng nghĩa', 'Thành ngữ Kanji']
            },
            {
                title: 'Ngữ pháp học thuật',
                description: 'Ngữ pháp phức tạp cho văn viết và học thuật',
                duration: '20 tuần',
                hasTest: true,
                topics: ['Ngữ pháp văn viết', 'Kính ngữ cao cấp', 'Mẫu câu học thuật', 'Diễn đạt chính thức']
            },
            {
                title: 'Đọc hiểu nâng cao',
                description: 'Đọc hiểu báo chí, tiểu thuyết và tài liệu học thuật',
                duration: '12 tuần',
                hasTest: true,
                topics: ['Báo chí', 'Tiểu thuyết', 'Luận văn', 'Tài liệu chuyên ngành']
            },
            {
                title: 'Kỹ năng học thuật',
                description: 'Chuẩn bị cho môi trường học tập tại Nhật Bản',
                duration: '8 tuần',
                hasTest: false,
                topics: ['Viết luận văn', 'Thuyết trình', 'Phỏng vấn', 'Giao tiếp công việc']
            }
        ]
    };
    return curriculums[level] || [];
}

// Load course teachers tab
function loadCourseTeachers(course) {
    const container = document.getElementById('course-teachers-content');
    const courseTeachers = teachers.filter(teacher => teacher.courses.includes(course.id));
    
    container.innerHTML = `
        <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-chalkboard-teacher text-green-500 mr-2"></i>
                Đội ngũ giảng viên
            </h3>
            <div class="grid md:grid-cols-2 gap-6">
                ${courseTeachers.map(teacher => `
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <div class="flex items-center mb-4">
                            <div class="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                                ${teacher.name.charAt(0)}
                            </div>
                            <div>
                                <h4 class="text-xl font-bold text-gray-800">${teacher.nameVi}</h4>
                                <p class="text-blue-600 font-semibold">${teacher.title}</p>
                            </div>
                        </div>
                        
                        <div class="space-y-3 mb-4">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Kinh nghiệm:</span>
                                <span class="font-semibold">${teacher.experience}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Chuyên môn:</span>
                                <span class="font-semibold text-sm">${teacher.specialization}</span>
                            </div>
                        </div>
                        
                        <div class="bg-white p-4 rounded-lg mb-4">
                            <h5 class="font-semibold text-gray-700 mb-2">Học vấn:</h5>
                            <p class="text-sm text-gray-600">${teacher.education}</p>
                        </div>
                        
                        <p class="text-sm text-gray-600">${teacher.description}</p>
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
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-calendar-alt text-purple-500 mr-2"></i>
                Lịch học chi tiết
            </h3>
            
            <div class="grid lg:grid-cols-2 gap-8">
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                    <h4 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-clock text-purple-500 mr-2"></i>
                        Thời gian biểu
                    </h4>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span class="font-semibold text-gray-700">Lịch học:</span>
                            <span class="text-purple-600 font-bold">${course.schedule}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span class="font-semibold text-gray-700">Thời gian:</span>
                            <span class="text-purple-600 font-bold">${course.duration}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span class="font-semibold text-gray-700">Khai giảng:</span>
                            <span class="text-purple-600 font-bold">${new Date(course.startDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span class="font-semibold text-gray-700">Sĩ số:</span>
                            <span class="text-purple-600 font-bold">${course.maxStudents} học viên</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                    <h4 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                        Thông tin lớp học
                    </h4>
                    <div class="space-y-4">
                        <div class="bg-white p-4 rounded-lg">
                            <h5 class="font-semibold text-gray-700 mb-2">Địa điểm:</h5>
                            <p class="text-gray-600">Trung tâm Nhật ngữ TTTN</p>
                            <p class="text-gray-600">123 Đường ABC, Quận 1, TP.HCM</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg">
                            <h5 class="font-semibold text-gray-700 mb-2">Phòng học:</h5>
                            <p class="text-gray-600">Phòng ${course.level} - Tầng 2</p>
                            <p class="text-gray-600">Trang bị đầy đủ thiết bị hiện đại</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg">
                            <h5 class="font-semibold text-gray-700 mb-2">Ghi chú:</h5>
                            <p class="text-gray-600">• Mang theo sách giáo khoa</p>
                            <p class="text-gray-600">• Đến sớm 10 phút</p>
                            <p class="text-gray-600">• Thông báo khi vắng mặt</p>
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
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-star text-yellow-500 mr-2"></i>
                Đánh giá từ học viên
            </h3>
            
            <div class="grid gap-6">
                ${courseReviews.map(review => `
                    <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-l-4 border-yellow-400">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                    ${review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-800">${review.name}</h4>
                                    <p class="text-sm text-gray-600">${review.course}</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                ${Array.from({length: review.rating}, () => '<i class="fas fa-star text-yellow-500"></i>').join('')}
                            </div>
                        </div>
                        
                        <p class="text-gray-700 mb-4 italic">"${review.comment}"</p>
                        
                        <div class="flex justify-between items-center">
                            <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ${review.achievement}
                            </div>
                            <span class="text-sm text-gray-500">${new Date(review.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Clear course selection
function clearCourseSelection() {
    selectedCourse = null;
    const cards = document.querySelectorAll('.course-registration-card');
    cards.forEach(card => card.classList.remove('selected'));
}

// Show video preview modal
function showVideoPreview(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.videoUrl) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('video-preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'video-preview-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-gray-800" id="video-modal-title"></h3>
                    <button onclick="closeVideoPreview()" class="text-gray-500 hover:text-gray-700 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="aspect-video rounded-lg overflow-hidden mb-6">
                        <iframe 
                            id="video-modal-iframe"
                            class="w-full h-full"
                            src=""
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4 mb-6">
                        <div class="text-center">
                            <span class="text-gray-600">Trình độ:</span>
                            <span class="font-semibold" id="video-modal-level"></span>
                        </div>
                        <div class="text-center">
                            <span class="text-gray-600">Thời gian:</span>
                            <span class="font-semibold" id="video-modal-duration"></span>
                        </div>
                        <div class="text-center">
                            <span class="text-gray-600">Học phí:</span>
                            <span class="font-semibold text-blue-600" id="video-modal-price"></span>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <button id="video-modal-detail-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors">
                            Xem chi tiết khóa học
                        </button>
                        <button onclick="closeVideoPreview()" class="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Update modal content
    document.getElementById('video-modal-title').textContent = course.videoTitle;
    document.getElementById('video-modal-iframe').src = course.videoUrl;
    document.getElementById('video-modal-level').textContent = course.level;
    document.getElementById('video-modal-duration').textContent = course.duration;
    document.getElementById('video-modal-price').textContent = new Intl.NumberFormat('vi-VN').format(course.price) + ' ₫';
    
    // Update detail button
    const detailBtn = document.getElementById('video-modal-detail-btn');
    detailBtn.onclick = function() {
        closeVideoPreview();
        showCourseDetails(courseId);
    };
    
    // Show modal
    modal.style.display = 'flex';
    
    // Close on outside click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeVideoPreview();
        }
    };
}

// Close video preview modal
function closeVideoPreview() {
    const modal = document.getElementById('video-preview-modal');
    if (modal) {
        modal.style.display = 'none';
        // Stop video by removing src
        const iframe = document.getElementById('video-modal-iframe');
        if (iframe) {
            iframe.src = '';
        }
    }
}

// Render course comparison table
function renderCourseComparison() {
    const tbody = document.getElementById('comparison-table-body');
    if (!tbody) return;
    
    const comparisonData = [
        { feature: 'Trình độ', n5: 'Cơ bản (N5)', n4n3: 'Trung cấp (N4-N3)', n2n1: 'Cao cấp (N2-N1)' },
        { feature: 'Thời gian học', n5: '6 tháng', n4n3: '8 tháng', n2n1: '12 tháng' },
        { feature: 'Số buổi/tuần', n5: '3 buổi', n4n3: '3 buổi', n2n1: '3 buổi' },
        { feature: 'Thời lượng/buổi', n5: '2 giờ', n4n3: '2 giờ', n2n1: '2 giờ' },
        { feature: 'Sĩ số lớp', n5: '20 học viên', n4n3: '15 học viên', n2n1: '10 học viên' },
        { feature: 'Học phí', n5: '5,000,000 ₫', n4n3: '7,000,000 ₫', n2n1: '10,000,000 ₫' },
        { feature: 'Giáo viên', n5: 'Việt Nam + Nhật Bản', n4n3: 'Việt Nam + Nhật Bản', n2n1: 'Chủ yếu Nhật Bản' },
        { feature: 'Tài liệu', n5: 'Minna no Nihongo', n4n3: 'Minna no Nihongo + Shin Kanzen', n2n1: 'Shin Kanzen Master' },
        { feature: 'Luyện thi JLPT', n5: 'Cơ bản', n4n3: 'Chuyên sâu', n2n1: 'Chuyên nghiệp' },
        { feature: 'Hỗ trợ sau khóa', n5: '3 tháng', n4n3: '6 tháng', n2n1: '12 tháng' },
        { feature: 'Cam kết đầu ra', n5: 'Giao tiếp cơ bản', n4n3: 'Đỗ N3', n2n1: 'Đỗ N1' },
        { feature: 'Ưu đãi đặc biệt', n5: 'Tặng sách', n4n3: 'Tặng sách + Mock test', n2n1: 'Tặng sách + Tư vấn du học' }
    ];
    
    tbody.innerHTML = comparisonData.map(row => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${row.feature}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.n5}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.n4n3}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.n2n1}</td>
        </tr>
    `).join('');
}

// Render testimonials
function renderTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;
    
    container.innerHTML = testimonials.map(testimonial => `
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    ${testimonial.name.charAt(0)}
                </div>
                <div>
                    <h4 class="font-bold text-gray-800">${testimonial.name}</h4>
                    <p class="text-sm text-gray-600">${testimonial.course}</p>
                </div>
            </div>
            <div class="flex mb-3">
                ${Array.from({length: testimonial.rating}, () => '<i class="fas fa-star text-yellow-500"></i>').join('')}
            </div>
            <p class="text-gray-700 mb-4">"${testimonial.comment}"</p>
            <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                ${testimonial.achievement}
            </div>
        </div>
    `).join('');
}

// Initialize static tabs (for HTML structure)
function initializeStaticTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

// Initialize tabs (legacy function for compatibility)
function initializeTabs() {
    initializeStaticTabs();
}

// Initialize enrollment CTA
function initializeEnrollmentCTA() {
    const enrollBtn = document.getElementById('enroll-now-btn');
    const advisorBtn = document.getElementById('contact-advisor-btn');
    
    if (enrollBtn) {
        enrollBtn.addEventListener('click', function() {
            // Scroll to enrollment form
            const enrollmentSection = document.getElementById('enrollment-form');
            if (enrollmentSection) {
                enrollmentSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    if (advisorBtn) {
        advisorBtn.addEventListener('click', function() {
            // Open contact modal or redirect to contact page
            window.open('tel:+84123456789', '_self');
        });
    }
}

// Get selected goals from form
function getSelectedGoals() {
    const checkboxes = document.querySelectorAll('input[name="goals"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Handle enrollment form submission
function handleEnrollmentSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const enrollmentData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        course: formData.get('course'),
        goals: getSelectedGoals(),
        experience: formData.get('experience'),
        schedule: formData.get('schedule'),
        message: formData.get('message')
    };
    
    console.log('Enrollment data:', enrollmentData);
    
    // Simulate API call
    setTimeout(() => {
        showSuccessModal();
        event.target.reset();
    }, 1000);
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// Close success modal
function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Course registration page loaded, starting initialization...');
    
    // Auto-format phone number (only if phone input exists)
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('84')) {
                value = '+84 ' + value.slice(2);
            } else if (value.startsWith('0')) {
                value = '+84 ' + value.slice(1);
            }
            e.target.value = value;
        });
    }
    
    // Load courses with mock data
    loadCourses();
    
    // Initialize tabs
    initializeTabs();
    
    // Initialize enrollment CTA
    initializeEnrollmentCTA();
    
    // Handle enrollment form submission
    const enrollmentForm = document.getElementById('enrollment-form-element');
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', handleEnrollmentSubmission);
    }
    
    console.log('Page initialization completed');
});

// Add CSS for video preview button
const style = document.createElement('style');
style.textContent = `
    .video-preview-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        opacity: 0;
    }
    
    .course-registration-card:hover .video-preview-btn {
        opacity: 1;
    }
    
    .video-preview-btn:hover {
        background: rgba(0, 0, 0, 0.9);
        transform: translate(-50%, -50%) scale(1.1);
    }
    
    .course-tab-btn {
        padding: 12px 24px;
        border: none;
        background: none;
        color: #6B7280;
        font-weight: 500;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .course-tab-btn.active {
        color: #3B82F6;
        border-bottom-color: #3B82F6;
    }
    
    .course-tab-btn:hover {
        color: #3B82F6;
    }
    
    .course-tab-content {
        display: none;
    }
    
    .course-tab-content.active {
        display: block;
    }
`;
document.head.appendChild(style);