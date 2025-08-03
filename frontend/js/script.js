// Initialize AOS
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
});

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
    initSakuraAnimation();
    initScrollAnimations();
    initContactForm();
    initLoadingScreen();
    initMobileMenu();
    initSmoothScrolling();
    loadTeachersForHomepage(); // Load teachers dynamically
    loadCoursesForContactForm(); // Load courses for contact form
    loadCoursesForHomepage(); // Load courses for homepage display
});

// Enhanced Theme Toggle Function - Genshin Impact Style
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const transitionOverlay = document.getElementById('theme-transition-overlay');
    const toggleLabel = document.querySelector('.toggle-label');

    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        updateToggleLabel(true);
    }

    // Function to update toggle label
    function updateToggleLabel(isDarkMode) {
        if (toggleLabel) {
            toggleLabel.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
        }
    }

    // Function to handle theme toggle with epic transition
    function toggleTheme(button) {
        // Start epic transition animation
        startThemeTransition();

        // Delay the actual theme change to sync with school building animation
        setTimeout(() => {
            // Toggle dark mode
            body.classList.toggle('dark-mode');

            // Save theme preference
            const isDarkMode = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

            // Update toggle label
            updateToggleLabel(isDarkMode);

            // Update sakura colors for dark mode
            updateSakuraColors(isDarkMode);

            // Create magic particles effect
            createMagicParticles(button);

            // Show enhanced notification with school theme
            showEnhancedNotification(
                isDarkMode ? '🌙 Chào đêm! Trường học đã chuyển sang chế độ tối' : '☀️ Chào ngày mới! Trường học đã sáng lên',
                isDarkMode ? 'dark' : 'light'
            );

            // End transition after school animation completes
            setTimeout(() => {
                endThemeTransition();
            }, 2500);
        }, 800);
    }

    // Start school day-night transition animation
    function startThemeTransition() {
        if (transitionOverlay) {
            transitionOverlay.classList.add('active');
            
            // Create magical transition sparkles
            const sparkleContainer = document.createElement('div');
            sparkleContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 10001;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.5s ease;
            `;
            
            // Create multiple sparkles
            for (let i = 0; i < 12; i++) {
                const sparkle = document.createElement('div');
                sparkle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: radial-gradient(circle, #FFD700, transparent);
                    border-radius: 50%;
                    top: ${Math.random() * 60 + 20}%;
                    left: ${Math.random() * 80 + 10}%;
                    animation: sparkleAnimation ${1 + Math.random() * 2}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;
                sparkleContainer.appendChild(sparkle);
            }
            
            document.body.appendChild(sparkleContainer);
            
            // Add sparkle animation
            if (!document.getElementById('sparkle-keyframes')) {
                const style = document.createElement('style');
                style.id = 'sparkle-keyframes';
                style.textContent = `
                    @keyframes sparkleAnimation {
                        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
                        50% { opacity: 1; transform: scale(1) rotate(180deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Show sparkles
            requestAnimationFrame(() => {
                sparkleContainer.style.opacity = '1';
                
                // Remove sparkles after animation
                setTimeout(() => {
                    sparkleContainer.style.opacity = '0';
                    setTimeout(() => {
                        if (sparkleContainer.parentNode) {
                            sparkleContainer.parentNode.removeChild(sparkleContainer);
                        }
                    }, 500);
                }, 1500);
            });
        }
    }

    // End transition animation
    function endThemeTransition() {
        if (transitionOverlay) {
            transitionOverlay.classList.remove('active');
        }
    }

    // Create magic particles effect around button
    function createMagicParticles(button) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            createParticle(centerX, centerY, i);
        }
    }

    // Create individual magic particle
    function createParticle(x, y, index) {
        const particle = document.createElement('div');
        const isDarkMode = body.classList.contains('dark-mode');
        
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 6px;
            height: 6px;
            background: ${isDarkMode ? 
                'radial-gradient(circle, #3b82f6, #1d4ed8)' : 
                'radial-gradient(circle, #fbbf24, #f59e0b)'};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10001;
            opacity: 1;
            transform: scale(0);
            box-shadow: 0 0 10px ${isDarkMode ? '#3b82f6' : '#fbbf24'};
        `;

        document.body.appendChild(particle);

        // Animate particle
        const angle = (index / 12) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;

        requestAnimationFrame(() => {
            particle.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            particle.style.transform = `translate(${endX - x}px, ${endY - y}px) scale(1.5)`;
            particle.style.opacity = '0';
        });

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }

    // Enhanced notification
    function showEnhancedNotification(message, type) {
        const notification = document.createElement('div');
        const isDarkMode = type === 'dark';
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${isDarkMode ? 
                'linear-gradient(135deg, #1e293b, #334155)' : 
                'linear-gradient(135deg, #fbbf24, #f59e0b)'};
            color: ${isDarkMode ? '#e2e8f0' : '#ffffff'};
            padding: 15px 20px;
            border-radius: 15px;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 10px 30px ${isDarkMode ? 
                'rgba(59, 130, 246, 0.3)' : 
                'rgba(251, 191, 36, 0.3)'};
            z-index: 10002;
            opacity: 0;
            transform: translateX(100px) scale(0.8);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 2px solid ${isDarkMode ? '#3b82f6' : '#ffffff'};
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0) scale(1)';
        });

        // Remove notification
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px) scale(0.8)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 3000);
    }

    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleTheme(this);
        });
    }
}

// Update sakura colors based on theme
function updateSakuraColors(isDarkMode) {
    const sakuraElements = document.querySelectorAll('.sakura');
    sakuraElements.forEach(sakura => {
        if (isDarkMode) {
            sakura.style.background = '#4f46e5'; // Indigo for dark mode
            sakura.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.3)';
        } else {
            const colors = ['#ffd1dc', '#ffb7c5', '#ffc0cb', '#ff69b4'];
            sakura.style.background = colors[Math.floor(Math.random() * colors.length)];
            sakura.style.boxShadow = '0 2px 8px rgba(255, 182, 193, 0.3)';
        }
    });
}

// Enhanced Sakura Animation
function initSakuraAnimation() {
    const container = document.getElementById('sakura-container');
    if (!container) return;

    function createSakura() {
        const sakura = document.createElement('div');
        sakura.className = 'sakura';
        
        // Random size between 8-25px for more variety
        const size = Math.random() * 17 + 8;
        sakura.style.width = size + 'px';
        sakura.style.height = size + 'px';
        
        // Random position across full width
        sakura.style.left = Math.random() * 100 + '%';
        sakura.style.top = '-50px'; // Start above screen
        
        // Random animation duration between 8-25s for varied falling speeds
        const duration = Math.random() * 17 + 8;
        sakura.style.animationDuration = duration + 's';
        
        // Random delay for more natural movement
        const delay = Math.random() * 2;
        sakura.style.animationDelay = delay + 's';
        
        // Randomly choose between regular fall and wind effect
        const useWindEffect = Math.random() > 0.4;
        sakura.style.animationName = useWindEffect ? 'fallWithWind' : 'fall';
        
        // Set initial color and effects based on theme
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            sakura.style.background = '#4f46e5';
            sakura.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.3)';
        } else {
            const colors = ['#ffd1dc', '#ffb7c5', '#ffc0cb', '#ff69b4'];
            sakura.style.background = colors[Math.floor(Math.random() * colors.length)];
            sakura.style.boxShadow = '0 2px 8px rgba(255, 182, 193, 0.3)';
        }
        
        // Random opacity for depth effect
        sakura.style.opacity = 0.6 + Math.random() * 0.4;
        
        container.appendChild(sakura);
        
        // Remove sakura after animation
        setTimeout(() => {
            if (sakura.parentNode) {
                sakura.parentNode.removeChild(sakura);
            }
        }, (duration + delay) * 1000);
    }
    
    // Create more sakura more frequently for fuller effect
    setInterval(createSakura, 200);
    
    // Create initial burst of sakura
    for (let i = 0; i < 15; i++) {
        setTimeout(createSakura, i * 100);
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    // Observe all elements with scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Contact Form Handler
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const btnContent = submitBtn.querySelector('.btn-content');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        // Show loading state
        submitBtn.classList.add('loading');
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name') || form.querySelector('input[type="text"]').value,
            email: formData.get('email') || form.querySelector('input[type="email"]').value,
            phone: formData.get('phone') || form.querySelector('input[type="tel"]').value,
            course: formData.get('course') || form.querySelector('select').value,
            message: formData.get('message') || form.querySelector('textarea').value
        };
        
        try {
            // Simulate API call (replace with actual endpoint)
            const response = await fetch('/tttn/backend/api/contact_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification('Tin nhắn đã được gửi thành công!', 'success');
                form.reset();
            } else {
                showNotification(result.message || 'Có lỗi xảy ra, vui lòng thử lại!', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        } finally {
            // Hide loading state
            setTimeout(() => {
                submitBtn.classList.remove('loading');
            }, 1000);
        }
    });
}

// Loading Screen
function initLoadingScreen() {
    const loading = document.querySelector('.loading');
    if (loading) {
        setTimeout(() => {
            loading.classList.add('hidden');
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }, 2000);
    }
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('mobile-menu-open');
        });
    }
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'linear-gradient(135deg, #10b981, #059669)';
        case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)';
        case 'warning': return 'linear-gradient(135deg, #f59e0b, #d97706)';
        default: return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.feature-card, .course-card, .teacher-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Initialize counter animations for stats
    initStatsCounter();
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-out-cubic',
            once: true,
            offset: 120
        });
    }
});

// Counter Animation for Stats
function initStatsCounter() {
    const counters = document.querySelectorAll('.stats-number, .stat-number-school');
    const speed = 200; // Animation speed
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const increment = target / speed;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                if (current > target) current = target;
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    // Use Intersection Observer to trigger animation when visible
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                // Add a small delay for staggered effect
                const delay = Array.from(counters).indexOf(counter) * 200;
                setTimeout(() => {
                    animateCounter(counter);
                }, delay);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Helper function to scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Load teachers for homepage display
async function loadTeachersForHomepage() {
    try {
        console.log('🔍 Loading teachers for homepage...');
        
        const response = await fetch('/tttn/backend/api/teachers_api.php');
        console.log('📡 Response status:', response.status);
        
        const data = await response.json();
        console.log('📊 Teachers data received:', data);
        
        if (data.success && data.data && data.data.length > 0) {
                    console.log('✅ Rendering', data.data.length, 'teachers');
        console.log('👥 Teachers list:', data.data.map(t => `${t.name} (${t.position})`));
        renderTeachersOnHomepage(data.data);
        } else {
            console.warn('⚠️ No teachers data found');
            showNoTeachersMessage();
        }
    } catch (error) {
        console.error('❌ Teachers loading failed:', error);
        showErrorMessage(error);
    }
}

// Show no teachers message
function showNoTeachersMessage() {
    const teachersContainer = document.getElementById('teachers-container');
    if (teachersContainer) {
        teachersContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-500">
                    <i class="fas fa-user-slash text-4xl mb-4"></i>
                    <p class="text-lg">Chưa có thông tin giảng viên</p>
                </div>
            </div>
        `;
    }
}

// Show error message
function showErrorMessage(error) {
    const teachersContainer = document.getElementById('teachers-container');
    if (teachersContainer) {
        teachersContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-red-500">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p class="text-lg">Không thể tải thông tin giảng viên</p>
                    <p class="text-sm mt-2 opacity-70">Lỗi: ${error.message}</p>
                    <button onclick="loadTeachersForHomepage()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-redo mr-2"></i>Thử lại
                    </button>
                </div>
            </div>
        `;
    }
}

// Render teachers dynamically on homepage
function renderTeachersOnHomepage(teachers) {
    console.log('Rendering teachers on homepage:', teachers);
    
    // Get the teachers container
    const teachersContainer = document.getElementById('teachers-container');
    if (!teachersContainer) {
        console.error('Teachers container not found');
        return;
    }
    
    // Clear loading state
    teachersContainer.innerHTML = '';
    
    if (!teachers || teachers.length === 0) {
        teachersContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-500">
                    <i class="fas fa-user-slash text-4xl mb-4"></i>
                    <p class="text-lg">Chưa có thông tin giảng viên</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Create simple teacher cards
    teachersContainer.innerHTML = teachers.map(teacher => `
        <div class="teacher-simple-card">
            <div class="teacher-avatar">
                ${(teacher.image_url && teacher.image_url.trim() !== '' && teacher.image_url !== 'null') || 
                  (teacher.image && teacher.image.trim() !== '' && teacher.image !== 'null') ? 
                    `<img src="${teacher.image_url || teacher.image}" alt="${teacher.name}" class="teacher-photo" 
                           onerror="this.style.display='none'; this.parentElement.querySelector('.teacher-icon').style.display='flex';">
                     <div class="teacher-icon" style="display: none;">
                        <i class="fas fa-user"></i>
                     </div>` : 
                    `<div class="teacher-icon">
                        <i class="fas fa-user"></i>
                     </div>`
                }
            </div>
            <div class="teacher-content">
                <h4 class="teacher-name">${teacher.name}</h4>
                <p class="teacher-position">${teacher.position || 'Giảng viên'}</p>
                <p class="teacher-description">${teacher.description || 'Giảng viên giàu kinh nghiệm trong việc giảng dạy tiếng Nhật.'}</p>
            </div>
        </div>
    `).join('');
    
    // Add CSS styles for teacher cards
    addTeacherCardStyles();
}

// Add CSS styles for simple teacher cards
function addTeacherCardStyles() {
    if (document.getElementById('teacher-card-styles')) return; // Prevent duplicate styles
    
    const style = document.createElement('style');
    style.id = 'teacher-card-styles';
    style.textContent = `
        .teacher-simple-card {
            background: white/90;
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.2);
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .teacher-simple-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .teacher-avatar {
            width: 100px;
            height: 100px;
            margin: 0 auto 1rem;
            position: relative;
        }
        
        .teacher-photo {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #e5e7eb;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .teacher-icon {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #e5e7eb;
        }
        
        .teacher-icon i {
            font-size: 2.5rem;
            color: #9ca3af;
        }
        
        .teacher-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .teacher-name {
            font-size: 1.25rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }
        
        .teacher-position {
            font-size: 0.875rem;
            color: #6366f1;
            font-weight: 600;
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .teacher-description {
            font-size: 0.875rem;
            color: #6b7280;
            line-height: 1.5;
            flex: 1;
        }
        
        /* Animation */
        .teacher-simple-card {
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
            transform: translateY(30px);
        }
        
        .teacher-simple-card:nth-child(1) { animation-delay: 0.1s; }
        .teacher-simple-card:nth-child(2) { animation-delay: 0.2s; }
        .teacher-simple-card:nth-child(3) { animation-delay: 0.3s; }
        .teacher-simple-card:nth-child(4) { animation-delay: 0.4s; }
        .teacher-simple-card:nth-child(5) { animation-delay: 0.5s; }
        .teacher-simple-card:nth-child(6) { animation-delay: 0.6s; }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .teacher-simple-card {
                padding: 1rem;
            }
            
            .teacher-avatar {
                width: 80px;
                height: 80px;
            }
            
            .teacher-icon i {
                font-size: 2rem;
            }
            
            .teacher-name {
                font-size: 1.125rem;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Load courses for contact form
async function loadCoursesForContactForm() {
    try {
        console.log('🔍 Loading courses for contact form...');
        
        const response = await fetch('/tttn/backend/api/courses_api.php');
        console.log('📡 Courses response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Courses data received:', data);
        
        if (data.success && data.data && data.data.length > 0) {
            console.log('✅ Populating course select with', data.data.length, 'courses');
            populateCourseSelect(data.data);
        } else {
            console.warn('⚠️ No courses data found');
        }
    } catch (error) {
        console.error('❌ Courses loading failed:', error);
    }
}

// Populate course select dropdown
function populateCourseSelect(courses) {
    const courseSelect = document.querySelector('select[name="course_id"]');
    if (!courseSelect) {
        console.warn('Course select element not found');
        return;
    }
    
    // Clear existing options except the first one
    courseSelect.innerHTML = '<option value="">Chọn khóa học</option>';
    
    // Add courses from database
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${course.name} (${course.level})`;
        courseSelect.appendChild(option);
    });
}

// Enhanced contact form handler
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data directly from form elements with debug
        const first_name = document.querySelector('input[name="first_name"]');
        const last_name = document.querySelector('input[name="last_name"]');
        const email = document.querySelector('input[name="email"]');
        const phone = document.querySelector('input[name="phone"]');
        const country_code = document.querySelector('select[name="country_code"]');
        const course_id = document.querySelector('select[name="course_id"]');
        const message = document.querySelector('textarea[name="message"]');
        const nationality = document.querySelector('input[name="nationality"]');
        
        console.log('🔍 Form elements found:', {
            first_name: first_name ? 'Found' : 'NOT FOUND',
            last_name: last_name ? 'Found' : 'NOT FOUND',
            email: email ? 'Found' : 'NOT FOUND',
            phone: phone ? 'Found' : 'NOT FOUND',
            country_code: country_code ? 'Found' : 'NOT FOUND',
            course_id: course_id ? 'Found' : 'NOT FOUND',
            message: message ? 'Found' : 'NOT FOUND',
            nationality: nationality ? 'Found' : 'NOT FOUND'
        });
        
        const contactData = {
            first_name: first_name ? first_name.value.trim() : '',
            last_name: last_name ? last_name.value.trim() : '',
            email: email ? email.value.trim() : '',
            phone: phone ? phone.value.trim() : '',
            country_code: country_code ? country_code.value : '+84',
            course_id: course_id ? course_id.value : '',
            message: message ? message.value.trim() : '',
            nationality: nationality ? nationality.value.trim() : 'Việt Nam'
        };
        
        // Validate required fields
        const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'course_id', 'message'];
        for (const field of requiredFields) {
            if (!contactData[field] || contactData[field].trim() === '') {
                alert(`Vui lòng điền đầy đủ thông tin: ${field}`);
                return;
            }
        }
        
        // Validate email
        if (!isValidEmail(contactData.email)) {
            alert('Vui lòng nhập email hợp lệ');
            return;
        }
        
        // Check reCAPTCHA
        const recaptcha = document.getElementById('recaptcha');
        if (!recaptcha.checked) {
            alert('Vui lòng xác nhận bạn không phải là robot');
            return;
        }
        
        // Debug: Log the contact data
        console.log('📝 Contact data to submit:', contactData);
        
        try {
            await submitContactForm(contactData);
        } catch (error) {
            console.error('Contact form submission error:', error);
            alert('Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại!');
        }
    });
}

// Submit contact form
async function submitContactForm(contactData) {
    try {
        console.log('📤 Submitting contact form:', contactData);
        
        const response = await fetch('/tttn/backend/api/contact_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        const responseText = await response.text();
        console.log('📬 Raw response:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            throw new Error('Invalid JSON response from server');
        }
        
        console.log('📬 Contact form result:', result);
        
        if (result.success) {
            // Show success message
            alert('✅ Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.');
            
            // Reset form
            document.getElementById('contact-form').reset();
            document.getElementById('recaptcha').checked = false;
            
        } else {
            alert('❌ ' + (result.message || 'Có lỗi xảy ra khi gửi thông tin'));
        }
    } catch (error) {
        throw new Error('Network error: ' + error.message);
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
} 

// Load courses for homepage display
async function loadCoursesForHomepage() {
    console.log('🔍 Loading courses for homepage...');
    
    try {
        const response = await fetch('/tttn/backend/api/courses_api.php');
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📚 Courses API result:', result);
        
        if (result.success && result.data) {
            renderCoursesOnHomepage(result.data);
        } else {
            throw new Error(result.message || 'Failed to load courses');
        }
        
    } catch (error) {
        console.error('❌ Courses loading failed:', error);
        showCoursesErrorMessage(error);
    }
}

function showCoursesErrorMessage(error) {
    const container = document.getElementById('courses-container');
    if (container) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <div class="inline-block">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <p class="text-lg text-gray-600 mb-2">Không thể tải thông tin khóa học</p>
                    <p class="text-sm text-gray-500">${error.message}</p>
                    <button onclick="loadCoursesForHomepage()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <i class="fas fa-refresh mr-2"></i>Thử lại
                    </button>
                </div>
            </div>
        `;
    }
}

function renderCoursesOnHomepage(courses) {
    const container = document.getElementById('courses-container');
    if (!container) {
        console.error('❌ Courses container not found');
        return;
    }
    
    console.log('🎨 Rendering courses:', courses);
    
    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <div class="inline-block">
                    <i class="fas fa-info-circle text-4xl text-blue-500 mb-4"></i>
                    <p class="text-lg text-gray-600">Chưa có khóa học nào</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Clear loading state
    container.innerHTML = '';
    
    // Render each course
    courses.forEach((course, index) => {
        const courseCard = createCourseCard(course, index);
        container.appendChild(courseCard);
    });
}

function createCourseCard(course, index) {
    const courseCard = document.createElement('div');
    courseCard.className = 'tokyo-course-card';
    courseCard.setAttribute('data-course', course.id);
    courseCard.setAttribute('data-aos', 'fade-up');
    courseCard.setAttribute('data-aos-delay', (index * 200).toString());
    
    // Get course icon and color based on level or random for new courses
    const courseIcon = getCourseIcon(course.level);
    const courseLevel = getCourseLevelText(course.level);
    const courseColor = getCourseColor(course.level, course.id);
    
    // Generate features based on level since features field doesn't exist
    const features = getCourseFeatures(course.level);
    
    // Parse duration string to extract weeks (e.g., "6 tháng" -> 24 weeks)
    const durationWeeks = parseDurationToWeeks(course.duration);
    const totalHours = durationWeeks * 8; // Assume 8 hours per week
    
    courseCard.innerHTML = `
        <div class="course-header">
            <div class="course-level-badge" style="background: ${courseColor.badge};">${courseLevel}</div>
            <div class="course-icon-container">
                <div class="course-icon-bg" style="background: ${courseColor.icon};"></div>
                <i class="${courseIcon} course-icon"></i>
            </div>
        </div>
        
        <div class="course-content">
            <h3 class="course-title" style="color: ${courseColor.title};">${course.name}</h3>
            <p class="course-subtitle">${course.level}</p>
            <p class="course-description">${course.description || 'Khóa học tiếng Nhật chất lượng cao'}</p>
            
            <div class="course-features">
                ${features.map(feature => `
                    <div class="feature-item">
                        <i class="fas fa-check-circle" style="color: ${courseColor.icon};"></i>
                        <span>${feature}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="course-stats">
                <div class="stat-item">
                    <span class="stat-number">${durationWeeks}</span>
                    <span class="stat-label">Tuần</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${totalHours}</span>
                    <span class="stat-label">Giờ học</span>
                </div>
            </div>
        </div>
        
        <div class="course-footer">
            <button class="course-btn" style="background: ${courseColor.button};" onclick="window.location.href='course-registration.html?course=${course.id}'">
                <span>Xem các khóa học nổi bật</span>
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    return courseCard;
}

function getCourseIcon(level) {
    if (level.includes('N5') || level.includes('Cơ bản')) {
        return 'fas fa-seedling';
    } else if (level.includes('N4') || level.includes('N3') || level.includes('Trung cấp')) {
        return 'fas fa-mountain';
    } else if (level.includes('N2') || level.includes('N1') || level.includes('Cao cấp')) {
        return 'fas fa-crown';
    }
    
    // For new courses, return a random icon
    return getRandomIcon();
}

function getRandomIcon() {
    const icons = [
        'fas fa-graduation-cap',
        'fas fa-book',
        'fas fa-language',
        'fas fa-globe',
        'fas fa-star',
        'fas fa-heart',
        'fas fa-lightbulb',
        'fas fa-rocket',
        'fas fa-gem',
        'fas fa-trophy',
        'fas fa-medal',
        'fas fa-award'
    ];
    
    // Return a random icon
    return icons[Math.floor(Math.random() * icons.length)];
}

function getCourseLevelText(level) {
    if (level.includes('N5')) {
        return 'Cơ bản N5';
    } else if (level.includes('N4') || level.includes('N3')) {
        return 'Trung cấp N4-N3';
    } else if (level.includes('N2') || level.includes('N1')) {
        return 'Cao cấp N2-N1';
    }
    return level;
} 

function parseDurationToWeeks(duration) {
    if (!duration) return 12; // Default fallback
    
    // Parse Vietnamese duration strings like "6 tháng", "8 tháng", "12 tháng"
    const match = duration.match(/(\d+)\s*tháng/);
    if (match) {
        const months = parseInt(match[1]);
        return months * 4; // Convert months to weeks (4 weeks per month)
    }
    
    // If it's already a number, assume it's weeks
    const num = parseInt(duration);
    if (!isNaN(num)) {
        return num;
    }
    
    return 12; // Default fallback
}

function getCourseFeatures(level) {
    if (level.includes('N5')) {
        return [
            'Hiragana & Katakana',
            'Ngữ pháp cơ bản N5',
            'Giao tiếp hàng ngày'
        ];
    } else if (level.includes('N4') || level.includes('N3')) {
        return [
            'Ngữ pháp N4-N3',
            'Luyện thi JLPT',
            'Văn hóa Nhật Bản'
        ];
    } else if (level.includes('N2') || level.includes('N1')) {
        return [
            'Ngữ pháp N2-N1',
            'Viết luận văn',
            'Phỏng vấn đại học'
        ];
    }
    
    return [
        'Ngữ pháp tiếng Nhật',
        'Luyện thi JLPT',
        'Giao tiếp thực tế'
    ];
} 

function getCourseColor(level, courseId) {
    // Predefined color schemes for known levels
    const colorSchemes = {
        'N5': {
            badge: 'linear-gradient(135deg, #10b981, #059669)',
            icon: '#10b981',
            title: '#059669',
            button: 'linear-gradient(135deg, #10b981, #059669)'
        },
        'N4-N3': {
            badge: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            icon: '#3b82f6',
            title: '#1d4ed8',
            button: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
        },
        'N2-N1': {
            badge: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            icon: '#8b5cf6',
            title: '#7c3aed',
            button: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        }
    };
    
    // Check if we have a predefined color for this level
    for (const [key, colors] of Object.entries(colorSchemes)) {
        if (level.includes(key)) {
            return colors;
        }
    }
    
    // For new courses or unknown levels, generate random colors
    return generateRandomColorScheme(courseId);
}

function generateRandomColorScheme(courseId) {
    // Use courseId as seed for consistent colors
    const colors = [
        {
            badge: 'linear-gradient(135deg, #f59e0b, #d97706)',
            icon: '#f59e0b',
            title: '#d97706',
            button: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        {
            badge: 'linear-gradient(135deg, #ef4444, #dc2626)',
            icon: '#ef4444',
            title: '#dc2626',
            button: 'linear-gradient(135deg, #ef4444, #dc2626)'
        },
        {
            badge: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            icon: '#06b6d4',
            title: '#0891b2',
            button: 'linear-gradient(135deg, #06b6d4, #0891b2)'
        },
        {
            badge: 'linear-gradient(135deg, #ec4899, #db2777)',
            icon: '#ec4899',
            title: '#db2777',
            button: 'linear-gradient(135deg, #ec4899, #db2777)'
        },
        {
            badge: 'linear-gradient(135deg, #84cc16, #65a30d)',
            icon: '#84cc16',
            title: '#65a30d',
            button: 'linear-gradient(135deg, #84cc16, #65a30d)'
        },
        {
            badge: 'linear-gradient(135deg, #f97316, #ea580c)',
            icon: '#f97316',
            title: '#ea580c',
            button: 'linear-gradient(135deg, #f97316, #ea580c)'
        }
    ];
    
    // Use courseId to select a consistent color
    const colorIndex = courseId % colors.length;
    return colors[colorIndex];
} 