// Enhanced Script with Modern Animations and Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Page Load Animation
    initPageLoadAnimation();
    
    // Scroll Animations
    initScrollAnimations();
    
    // Mobile Navigation
    initMobileNavigation();
    
    // Scroll to Top Button
    initScrollToTop();
    
    // Smooth Internal Links
    initSmoothScrolling();
    
    // Enhanced Interactions
    initEnhancedInteractions();
    
    // Intersection Observer for Scroll Effects
    initIntersectionObserver();
    
    // Load Phosphor Icons
    loadPhosphorIcons();
});

// Page Load Animation
function initPageLoadAnimation() {
    // Remove the CSS animation override and let it play naturally
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';
    
    // Trigger animation after a short delay to ensure DOM is ready
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
    }, 100);
}

// Scroll Animations for Elements
function initScrollAnimations() {
    // Add scroll-element class to all major sections and cards
    const elementsToAnimate = [
        '.about-card',
        '.contact-info',
        '.about-feature-card',
        '.service-category',
        '.contact-detail-card',
        '.section-title',
        '.second-cta',
        '.reviews',
        'footer'
    ];
    
    elementsToAnimate.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (!el.classList.contains('scroll-element')) {
                el.classList.add('scroll-element');
            }
        });
    });
}

// Intersection Observer for Scroll Effects
function initIntersectionObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Add staggered animation for multiple elements
                if (entry.target.parentElement && entry.target.parentElement.classList.contains('about-content')) {
                    const siblings = Array.from(entry.target.parentElement.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.1}s`;
                }
            }
        });
    }, options);
    
    // Observe all scroll elements
    document.querySelectorAll('.scroll-element').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced Mobile Navigation
function initMobileNavigation() {
    const header = document.querySelector('header');
    
    // Create mobile toggle if it doesn't exist
    if (!document.querySelector('.mobile-toggle')) {
        const mobileToggle = document.createElement('div');
        mobileToggle.className = 'mobile-toggle';
        mobileToggle.innerHTML = '<span></span><span></span><span></span>';
        
        header.querySelector('.container').appendChild(mobileToggle);
        
        // Add event listener
        mobileToggle.addEventListener('click', function() {
            const nav = document.querySelector('nav');
            nav.classList.toggle('active');
            this.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (nav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.querySelector('nav');
            const toggle = document.querySelector('.mobile-toggle');
            
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                toggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const nav = document.querySelector('nav');
        const toggle = document.querySelector('.mobile-toggle');
        
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !toggle.contains(e.target)) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Enhanced Scroll to Top
function initScrollToTop() {
    // Create scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.id = 'scrollTop';
    scrollButton.innerHTML = '<i class="ph-light ph-arrow-up"></i>';
    scrollButton.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollButton);
    
    // Show/hide based on scroll position
    let isVisible = false;
    window.addEventListener('scroll', () => {
        const shouldShow = window.scrollY > 500;
        
        if (shouldShow && !isVisible) {
            scrollButton.style.display = 'flex';
            setTimeout(() => {
                scrollButton.style.opacity = '1';
                scrollButton.style.transform = 'translateY(0)';
            }, 10);
            isVisible = true;
        } else if (!shouldShow && isVisible) {
            scrollButton.style.opacity = '0';
            scrollButton.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (!isVisible) scrollButton.style.display = 'none';
            }, 300);
            isVisible = false;
        }
    });
    
    // Smooth scroll to top
    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Initialize hidden state
    scrollButton.style.opacity = '0';
    scrollButton.style.transform = 'translateY(20px)';
    scrollButton.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
}

// Smooth Scrolling for Internal Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#' && document.querySelector(targetId)) {
                e.preventDefault();
                
                const target = document.querySelector(targetId);
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced Interactions
function initEnhancedInteractions() {
    // Add hover effects to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add magnetic effect to logo
    const logo = document.querySelector('.logo-container');
    if (logo) {
        logo.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0, 0) scale(1)';
        });
    }
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Enhanced form interactions
    document.querySelectorAll('input, textarea').forEach(input => {
        // Focus effects
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        // Floating label effect
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });
}

// Load Phosphor Icons
function loadPhosphorIcons() {
    // Load Phosphor Icons CSS
    const phosphorCSS = document.createElement('link');
    phosphorCSS.rel = 'stylesheet';
    phosphorCSS.href = 'https://unpkg.com/@phosphor-icons/web@2.0.3/src/light/style.css';
    document.head.appendChild(phosphorCSS);
    
    // Replace existing icons with Phosphor icons
    setTimeout(() => {
        replaceIconsWithPhosphor();
    }, 500);
}

// Replace FontAwesome icons with Phosphor equivalents
function replaceIconsWithPhosphor() {
    const iconMappings = {
        'fa-arrow-up': 'ph-light ph-arrow-up',
        'fa-chevron-left': 'ph-light ph-caret-left',
        'fa-chevron-right': 'ph-light ph-caret-right',
        'fa-phone': 'ph-light ph-phone',
        'fa-envelope': 'ph-light ph-envelope',
        'fa-map-marker-alt': 'ph-light ph-map-pin',
        'fa-clock': 'ph-light ph-clock',
        'fa-check': 'ph-light ph-check',
        'fa-star': 'ph-light ph-star',
        'fa-heart': 'ph-light ph-heart',
        'fa-shield': 'ph-light ph-shield',
        'fa-tools': 'ph-light ph-wrench',
        'fa-laptop': 'ph-light ph-laptop',
        'fa-wifi': 'ph-light ph-wifi-high',
        'fa-bug': 'ph-light ph-bug',
        'fa-lock': 'ph-light ph-lock',
        'fa-home': 'ph-light ph-house'
    };
    
    // Replace FontAwesome classes
    Object.keys(iconMappings).forEach(faClass => {
        const elements = document.querySelectorAll(`.${faClass}`);
        elements.forEach(el => {
            el.className = el.className.replace(faClass, iconMappings[faClass]);
            el.className = el.className.replace('fas', '').replace('far', '').replace('fab', '');
        });
    });
    
    // Update emoji icons with Phosphor icons where appropriate
    const emojiToPhosphor = {
        '🔧': '<i class="ph-light ph-wrench icon-gradient"></i>',
        '💡': '<i class="ph-light ph-lightbulb icon-gradient"></i>',
        '🧠': '<i class="ph-light ph-brain icon-gradient"></i>',
        '📞': '<i class="ph-light ph-phone icon-gradient"></i>',
        '⭐': '<i class="ph-light ph-star icon-gradient"></i>',
        '💻': '<i class="ph-light ph-laptop icon-gradient"></i>',
        '❤️': '<i class="ph-light ph-heart icon-gradient"></i>',
        '🏙️': '<i class="ph-light ph-buildings icon-gradient"></i>',
        '📧': '<i class="ph-light ph-envelope icon-gradient"></i>',
        '📱': '<i class="ph-light ph-device-mobile icon-gradient"></i>',
        '🔒': '<i class="ph-light ph-lock icon-gradient"></i>'
    };
    
    // Replace emoji icons in text content
    document.querySelectorAll('h2, h3, p, span').forEach(el => {
        let content = el.innerHTML;
        Object.keys(emojiToPhosphor).forEach(emoji => {
            if (content.includes(emoji)) {
                content = content.replace(emoji, emojiToPhosphor[emoji]);
            }
        });
        if (content !== el.innerHTML) {
            el.innerHTML = content;
        }
    });
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.98)';
        header.style.backdropFilter = 'blur(30px)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
        header.style.backdropFilter = 'blur(20px)';
    }
});

// Advanced Card Interactions
function initAdvancedCardEffects() {
    document.querySelectorAll('.glass-card, .about-card, .contact-info').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    });
}

// Initialize advanced effects after DOM is ready
setTimeout(initAdvancedCardEffects, 1000);

// Keyboard Navigation Enhancement
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        const nav = document.querySelector('nav');
        const toggle = document.querySelector('.mobile-toggle');
        
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Home key scrolls to top
    if (e.key === 'Home' && e.ctrlKey) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

// Performance optimized scroll listener
let ticking = false;
function updateOnScroll() {
    // Update header opacity
    const header = document.querySelector('header');
    const scrolled = window.pageYOffset;
    
    if (scrolled > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
    }
    
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
});

// Enhanced form validation with visual feedback
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
        
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                return false;
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    // Remove existing error styling
    field.classList.remove('error');
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
        }
    }
    
    // Add error styling if invalid
    if (!isValid) {
        field.classList.add('error');
        field.style.borderColor = 'var(--error-color, #ff6b6b)';
        field.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.2)';
    } else {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }
    
    return isValid;
}

// Initialize form validation
setTimeout(initFormValidation, 500);

// Add loading state to forms
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.innerHTML = '<i class="ph-light ph-spinner"></i> Sending...';
        }
    });
}); 