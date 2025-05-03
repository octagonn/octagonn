// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle functionality
    const createMobileMenu = () => {
        const header = document.querySelector('header');
        
        // Only create mobile menu if it doesn't exist yet
        if (!document.querySelector('.mobile-toggle')) {
            // Create mobile menu button
            const mobileToggle = document.createElement('div');
            mobileToggle.className = 'mobile-toggle';
            mobileToggle.innerHTML = '<span></span><span></span><span></span>';
            
            // Add button to header
            header.querySelector('.container').appendChild(mobileToggle);
            
            // Add event listener to toggle menu
            mobileToggle.addEventListener('click', function() {
                const nav = document.querySelector('nav');
                nav.classList.toggle('active');
                this.classList.toggle('active');
            });
            
            // Add mobile-specific styles
            const style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    nav {
                        display: none;
                        width: 100%;
                    }
                    
                    nav.active {
                        display: block;
                    }
                    
                    .mobile-toggle {
                        display: block;
                        cursor: pointer;
                        padding: 10px;
                    }
                    
                    .mobile-toggle span {
                        display: block;
                        width: 25px;
                        height: 3px;
                        background-color: #0056b3;
                        margin: 5px 0;
                        transition: transform 0.3s ease;
                    }
                    
                    .mobile-toggle.active span:nth-child(1) {
                        transform: rotate(45deg) translate(5px, 5px);
                    }
                    
                    .mobile-toggle.active span:nth-child(2) {
                        opacity: 0;
                    }
                    
                    .mobile-toggle.active span:nth-child(3) {
                        transform: rotate(-45deg) translate(8px, -8px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    // Call function to create mobile menu
    createMobileMenu();
    
    // Scroll to top button functionality
    const createScrollTopButton = () => {
        // Create button element
        const scrollButton = document.createElement('button');
        scrollButton.id = 'scrollTop';
        scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(scrollButton);
        
        // Add styles for the button
        const style = document.createElement('style');
        style.textContent = `
            #scrollTop {
                display: none;
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 99;
                border: none;
                outline: none;
                background-color: #0056b3;
                color: white;
                cursor: pointer;
                padding: 15px;
                border-radius: 50%;
                font-size: 18px;
                transition: background-color 0.3s;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            
            #scrollTop:hover {
                background-color: #003d82;
            }
        `;
        document.head.appendChild(style);
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
                scrollButton.style.display = 'block';
            } else {
                scrollButton.style.display = 'none';
            }
        });
        
        // Add click event to scroll to top
        scrollButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };
    
    // Call function to create scroll to top button
    createScrollTopButton();
    
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Make sure the target exists
            if (targetId !== '#' && document.querySelector(targetId)) {
                e.preventDefault();
                
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Implement a simple testimonial slider if testimonials exist
    const setupTestimonialSlider = () => {
        const testimonialsSection = document.querySelector('.testimonials-slider');
        
        if (testimonialsSection) {
            const testimonials = testimonialsSection.querySelectorAll('.testimonial');
            let currentIndex = 0;
            
            // Hide all testimonials except the first one
            testimonials.forEach((testimonial, index) => {
                if (index !== 0) {
                    testimonial.style.display = 'none';
                }
            });
            
            // Create navigation buttons
            const prevButton = document.createElement('button');
            prevButton.className = 'testimonial-nav prev';
            prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
            
            const nextButton = document.createElement('button');
            nextButton.className = 'testimonial-nav next';
            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
            
            testimonialsSection.appendChild(prevButton);
            testimonialsSection.appendChild(nextButton);
            
            // Add styles for navigation
            const style = document.createElement('style');
            style.textContent = `
                .testimonials-slider {
                    position: relative;
                }
                
                .testimonial-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #0056b3;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s;
                    z-index: 10;
                }
                
                .testimonial-nav:hover {
                    background: #003d82;
                }
                
                .testimonial-nav.prev {
                    left: 10px;
                }
                
                .testimonial-nav.next {
                    right: 10px;
                }
            `;
            document.head.appendChild(style);
            
            // Navigation functionality
            prevButton.addEventListener('click', () => {
                testimonials[currentIndex].style.display = 'none';
                currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                testimonials[currentIndex].style.display = 'block';
            });
            
            nextButton.addEventListener('click', () => {
                testimonials[currentIndex].style.display = 'none';
                currentIndex = (currentIndex + 1) % testimonials.length;
                testimonials[currentIndex].style.display = 'block';
            });
        }
    };
    
    // Call function to setup testimonial slider if exists
    setupTestimonialSlider();
}); 