// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Loading Screen Controller
    const loadingController = {
        screen: document.getElementById('loading-screen'),
        progressFill: document.getElementById('progress-fill'),
        loadingText: document.getElementById('loading-text'),
        progress: 0,
        messages: [
            'Initializing sustainable solutions...',
            'Loading eco-friendly systems...',
            'Preparing advanced machinery...',
            'Optimizing green technology...',
            'Ready to transform manufacturing!'
        ],
        
        init: function() {
            if (!this.screen) return;
            
            // Add loading class to body to prevent scrolling
            document.body.classList.add('loading');
            
            // Start progress animation
            this.startProgress();
        },
        
        startProgress: function() {
            const duration = 1800; // 1.8 seconds
            const interval = 50; // Update every 50ms
            const increment = (100 / (duration / interval));
            let messageIndex = 0;
            
            const progressTimer = setInterval(() => {
                this.progress += increment;
                
                if (this.progress >= 100) {
                    this.progress = 100;
                    clearInterval(progressTimer);
                    setTimeout(() => this.hide(), 300);
                }
                
                // Update progress bar
                if (this.progressFill) {
                    this.progressFill.style.width = this.progress + '%';
                }
                
                // Update loading message
                if (this.loadingText && Math.floor(this.progress / 20) > messageIndex) {
                    messageIndex = Math.floor(this.progress / 20);
                    if (messageIndex < this.messages.length) {
                        this.loadingText.textContent = this.messages[messageIndex];
                    }
                }
            }, interval);
        },
        
        hide: function() {
            if (this.screen) {
                this.screen.classList.add('fade-out');
                
                setTimeout(() => {
                    this.screen.style.display = 'none';
                    document.body.classList.remove('loading');
                    
                    // Initialize other components after loading
                    carousel.init();
                    lazyLoader.init();
                    slideAnimations.init();
                    
                    // Trigger hero animation
                    const heroContent = document.querySelector('.carousel-slide.active .carousel-content');
                    if (heroContent && heroContent.classList.contains('slide-animate')) {
                        setTimeout(() => {
                            heroContent.classList.add('animated');
                        }, 500);
                    }
                }, 500);
            }
        }
    };

    // Lazy Loading Controller (simplified since we're using direct image loading now)
    const lazyLoader = {
        images: [],
        observer: null,
        
        init: function() {
            // Check for reduced motion preference
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.loadAllImages();
                return;
            }
            
            this.images = document.querySelectorAll('.lazy-image[data-src]');
            if (this.images.length === 0) return;
            
            this.createObserver();
            this.observeImages();
        },
        
        createObserver: function() {
            const options = {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);
        },
        
        observeImages: function() {
            this.images.forEach(img => {
                this.observer.observe(img);
            });
        },
        
        loadImage: function(img) {
            const src = img.getAttribute('data-src');
            if (!src) return;
            
            // Create a new image to preload
            const newImg = new Image();
            newImg.onload = () => {
                img.src = src;
                img.classList.add('loaded');
            };
            newImg.onerror = () => {
                // Fallback: still add loaded class to hide shimmer
                img.classList.add('loaded');
            };
            newImg.src = src;
        },
        
        loadAllImages: function() {
            // For users with reduced motion preference, load all images immediately
            this.images = document.querySelectorAll('.lazy-image[data-src]');
            this.images.forEach(img => {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.classList.add('loaded');
                }
            });
        }
    };

    // Slide Animations Controller
    const slideAnimations = {
        elements: [],
        observer: null,
        isMobile: window.innerWidth <= 768,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        
        init: function() {
            // Skip animations on mobile or if reduced motion is preferred
            if (this.isMobile || this.reducedMotion) {
                this.disableAnimations();
                return;
            }
            
            this.elements = document.querySelectorAll('.slide-animate');
            if (this.elements.length === 0) return;
            
            this.createObserver();
            this.observeElements();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                const wasMobile = this.isMobile;
                this.isMobile = window.innerWidth <= 768;
                
                if (!wasMobile && this.isMobile) {
                    this.disableAnimations();
                }
            });
        },
        
        createObserver: function() {
            const options = {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.2
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                        const delay = entry.target.getAttribute('data-delay') || 0;
                        
                        setTimeout(() => {
                            entry.target.classList.add('animated');
                        }, parseInt(delay));
                        
                        // Only animate once
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);
        },
        
        observeElements: function() {
            this.elements.forEach(element => {
                this.observer.observe(element);
            });
        },
        
        disableAnimations: function() {
            this.elements = document.querySelectorAll('.slide-animate');
            this.elements.forEach(element => {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = 'none';
            });
        }
    };

    // Carousel functionality
    const carousel = {
        currentSlide: 0,
        totalSlides: 5,
        autoPlayInterval: null,
        autoPlayDelay: 1800, // Faster 1.8-second carousel
        
        init: function() {
            this.slides = document.querySelectorAll('.carousel-slide');
            this.indicators = document.querySelectorAll('.carousel-indicator');
            this.prevBtn = document.getElementById('prevBtn');
            this.nextBtn = document.getElementById('nextBtn');
            this.carousel = document.querySelector('.hero-carousel');
            
            if (!this.slides.length) return;
            
            this.bindEvents();
            this.startAutoPlay();
        },
        
        bindEvents: function() {
            // Navigation buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prevSlide());
            }
            
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.nextSlide());
            }
            
            // Indicators
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.goToSlide(index));
            });
            
            // Pause on hover
            if (this.carousel) {
                this.carousel.addEventListener('mouseenter', () => this.pauseAutoPlay());
                this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
            }
            
            // Touch/swipe support
            this.addTouchSupport();
            
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            });
        },
        
        addTouchSupport: function() {
            let startX = 0;
            let endX = 0;
            
            if (this.carousel) {
                this.carousel.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                }, { passive: true });
                
                this.carousel.addEventListener('touchend', (e) => {
                    endX = e.changedTouches[0].clientX;
                    this.handleSwipe(startX, endX);
                }, { passive: true });
            }
        },
        
        handleSwipe: function(startX, endX) {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        },
        
        goToSlide: function(slideIndex) {
            // Remove active class from current slide and indicator
            if (this.slides[this.currentSlide]) {
                this.slides[this.currentSlide].classList.remove('active');
                // Reset slide animation
                const content = this.slides[this.currentSlide].querySelector('.carousel-content');
                if (content && content.classList.contains('slide-animate')) {
                    content.classList.remove('animated');
                }
            }
            if (this.indicators[this.currentSlide]) {
                this.indicators[this.currentSlide].classList.remove('active');
            }
            
            // Update current slide
            this.currentSlide = slideIndex;
            
            // Add active class to new slide and indicator
            if (this.slides[this.currentSlide]) {
                this.slides[this.currentSlide].classList.add('active');
                // Trigger slide animation for hero content
                const content = this.slides[this.currentSlide].querySelector('.carousel-content');
                if (content && content.classList.contains('slide-animate')) {
                    setTimeout(() => {
                        content.classList.add('animated');
                    }, 100);
                }
            }
            if (this.indicators[this.currentSlide]) {
                this.indicators[this.currentSlide].classList.add('active');
            }
        },
        
        nextSlide: function() {
            const nextIndex = (this.currentSlide + 1) % this.totalSlides;
            this.goToSlide(nextIndex);
        },
        
        prevSlide: function() {
            const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
            this.goToSlide(prevIndex);
        },
        
        startAutoPlay: function() {
            this.pauseAutoPlay(); // Clear existing interval
            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, this.autoPlayDelay);
        },
        
        pauseAutoPlay: function() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }
    };

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    // Quote modal functionality
    const quoteBtn = document.getElementById('quote-btn');
    const quoteModal = document.getElementById('quoteModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.querySelector('.modal-overlay');

    if (quoteBtn && quoteModal) {
        quoteBtn.addEventListener('click', function() {
            quoteModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            carousel.pauseAutoPlay(); // Pause carousel when modal is open
        });
    }

    // Close modal functionality
    function closeModal() {
        if (quoteModal) {
            quoteModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            carousel.startAutoPlay(); // Resume carousel when modal is closed
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && quoteModal && !quoteModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }

            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    });

    // Hero buttons functionality
    const exploreBtns = document.querySelectorAll('.hero-buttons .btn--primary');
    const learnMoreBtns = document.querySelectorAll('.hero-buttons .btn--outline');

    exploreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productsSection = document.getElementById('products');
            if (productsSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = productsSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    learnMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = aboutSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Product card "Learn More" buttons
    const productBtns = document.querySelectorAll('.product-card .btn:not(#paper-bag-learn-more):not(#cutting-equipment-learn-more):not(#eco-packaging-learn-more)');
    productBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Open quote modal when clicking product "Learn More" buttons
            if (quoteModal) {
                quoteModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                carousel.pauseAutoPlay();
                
                // Pre-fill product interest based on the card
                const productCard = this.closest('.product-card');
                const productTitle = productCard.querySelector('h3').textContent;
                const quoteProductSelect = document.getElementById('quoteProduct');
                
                if (quoteProductSelect) {
                    if (productTitle.includes('Paper Bag')) {
                        quoteProductSelect.value = 'paper-bag-machines';
                    } else if (productTitle.includes('Cutting')) {
                        quoteProductSelect.value = 'cutting-equipment';
                    } else if (productTitle.includes('Packaging')) {
                        quoteProductSelect.value = 'packaging-solutions';
                    }
                }
            }
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.email || !data.message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate form submission
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            contactForm.reset();
        });
    }

    // Quote form handling
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(quoteForm);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.email || !data.company || !data.product) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate quote submission
            showNotification('Quote request submitted successfully! We will contact you within 24 hours.', 'success');
            quoteForm.reset();
            closeModal();
        });
    }

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (header) {
            if (currentScrollY > 100) {
                header.style.background = 'rgba(15, 15, 35, 0.98)';
                header.style.backdropFilter = 'blur(20px)';
                header.style.boxShadow = '0 2px 25px rgba(0, 212, 170, 0.15)';
            } else {
                header.style.background = 'rgba(15, 15, 35, 0.95)';
                header.style.backdropFilter = 'blur(20px)';
                header.style.boxShadow = '0 2px 20px rgba(0, 212, 170, 0.1)';
            }
        }
        
        lastScrollY = currentScrollY;
    });

    // Animate stats on scroll - improved version
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateStats = function() {
        statNumbers.forEach(stat => {
            if (isElementInViewport(stat) && !stat.classList.contains('animated')) {
                stat.classList.add('animated');
                animateNumber(stat);
            }
        });
    };

    // Initial check
    animateStats();
    window.addEventListener('scroll', animateStats);

    // Form input focus effects
    const formInputs = document.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });

    // Add enhanced hover effects to cards with glow
    const cards = document.querySelectorAll('.product-card, .benefit-card, .service-card, .contact-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 15px 40px rgba(0, 212, 170, 0.25)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });

    // Enhanced notification system for dark theme
    function createParticleEffect(element) {
        const particles = [];
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #00D4AA;
                border-radius: 50%;
                pointer-events: none;
                animation: particle-float 1s ease-out forwards;
            `;
            
            const rect = element.getBoundingClientRect();
            particle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            particle.style.top = (rect.top + Math.random() * rect.height) + 'px';
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }

    // Add particle effect CSS
    const particleCSS = document.createElement('style');
    particleCSS.textContent = `
        @keyframes particle-float {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-50px) scale(0.3);
            }
        }
        
        @keyframes fade-in {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in {
            animation: fade-in 0.6s ease-out forwards;
        }
    `;
    document.head.appendChild(particleCSS);

    // Add click effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            createParticleEffect(this);
            
            // Ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation CSS
    const rippleCSS = document.createElement('style');
    rippleCSS.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .btn {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(rippleCSS);

    // Initialize loading screen
    loadingController.init();
});

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Style the notification for dark theme
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        max-width: 400px;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 212, 170, 0.2);
        backdrop-filter: blur(20px);
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: var(--font-family-base);
        border: 1px solid rgba(0, 212, 170, 0.3);
    `;
    
    // Set notification colors based on type for dark theme
    if (type === 'success') {
        notification.style.background = 'rgba(16, 185, 129, 0.1)';
        notification.style.color = '#10B981';
        notification.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else if (type === 'error') {
        notification.style.background = 'rgba(239, 68, 68, 0.1)';
        notification.style.color = '#EF4444';
        notification.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    } else {
        notification.style.background = 'rgba(0, 212, 170, 0.1)';
        notification.style.color = '#00D4AA';
        notification.style.borderColor = 'rgba(0, 212, 170, 0.3)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 400);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 400);
        }
    }, 5000);
}

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    // A more lenient check to trigger animation even if part of the element is visible
    return rect.top <= (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0;
}

// Improved animateNumber function to ensure consistent values
function animateNumber(element) {
    const target = element.getAttribute('data-target') || element.textContent;
    const number = parseInt(target.replace(/\D/g, ''));
    const suffix = target.replace(/[\d,]/g, '');
    
    // Skip animation if already animated or no valid number
    if (element.hasAttribute('data-animated') || isNaN(number)) {
        return;
    }
    
    element.setAttribute('data-animated', 'true');
    
    const duration = 2000;
    const step = Math.max(1, number / (duration / 16)); // Ensure step is at least 1
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= number) {
            current = number;
            clearInterval(timer);
            // Ensure final value is exactly the target
            element.textContent = target;
            element.style.textShadow = '0 0 10px rgba(0, 212, 170, 0.7)';
            return;
        }
        
        let displayNumber = Math.floor(current);
        
        // Format large numbers
        if (target.includes('k') || target.includes('+')) {
            element.textContent = displayNumber + suffix;
        } else {
            element.textContent = displayNumber + suffix;
        }
        
        // Add glow effect during animation
        element.style.textShadow = `0 0 10px rgba(0, 212, 170, ${0.3 + (current / number) * 0.4})`;
    }, 16);
}

// Add CSS for enhanced dark theme effects
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.7;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.1);
    }
    
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(26, 26, 46, 0.98);
            flex-direction: column;
            padding: var(--space-20);
            border: 1px solid #374151;
            border-top: none;
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(0, 212, 170, 0.1);
        }
        
        .nav-menu.active li {
            margin: var(--space-8) 0;
        }
        
        .nav-menu.active li a {
            display: block;
            padding: var(--space-12);
            border-radius: var(--radius-base);
            transition: all 0.3s ease;
        }
        
        .nav-menu.active li a:hover {
            background: rgba(0, 212, 170, 0.1);
            transform: translateX(8px);
        }
        
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        .notification {
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
    
    .form-group.focused .form-label {
        color: #00D4AA;
        font-weight: 600;
        transform: translateY(-2px);
    }
    
    .form-group.focused .form-control {
        border-color: #00D4AA;
        box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.2);
        transform: translateY(-1px);
    }
    
    .form-group {
        transition: all 0.3s ease;
    }
    
    /* Loading states for forms */
    .btn.loading {
        position: relative;
        color: transparent;
    }
    
    .btn.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid #00D4AA;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;

document.head.appendChild(enhancedStyles);