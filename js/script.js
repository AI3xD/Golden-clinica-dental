// DOM Elements
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');
const header = document.getElementById('header');
const contactForm = document.getElementById('contact-form');

// Mobile Menu Toggle
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
        document.body.style.overflow = 'hidden';
    });
}

if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
        document.body.style.overflow = 'auto';
    });
}

// Close mobile menu when clicking on nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
        document.body.style.overflow = 'auto';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('show-menu') && 
        !navMenu.contains(e.target) && 
        navToggle && !navToggle.contains(e.target)) {
        navMenu.classList.remove('show-menu');
        document.body.style.overflow = 'auto';
    }
});

// Header scroll effect
function scrollHeader() {
    if (header) {
        if (window.scrollY >= 50) {
            header.classList.add('scroll-header');
        } else {
            header.classList.remove('scroll-header');
        }
    }
}

window.addEventListener('scroll', scrollHeader);

// Active link highlighting - CORREGIDO
function highlightActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    // Remover todas las clases activas primero
    navLinks.forEach(link => {
        link.classList.remove('active-link');
    });
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150; // Ajuste para el header
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            currentSection = sectionId;
        }
    });
    
    // Si estamos en la parte superior de la página, activar "inicio"
    if (scrollY < 100) {
        currentSection = 'inicio';
    }
    
    // Si estamos cerca del final de la página, activar "contacto"
    if ((window.innerHeight + scrollY) >= document.body.offsetHeight - 100) {
        currentSection = 'contacto';
    }
    
    // Activar el enlace correspondiente
    if (currentSection) {
        const activeLink = document.querySelector(`.nav__link[data-section="${currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active-link');
        }
    }
}

window.addEventListener('scroll', highlightActiveLink);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target && header) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Contact form handling
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Basic form validation
        if (!validateForm(formObject)) {
            return;
        }
        
        // Show loading state
        const submitButton = this.querySelector('.contact__form-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;
        
        // Simulate form submission (replace with actual PHP endpoint)
        setTimeout(() => {
            // Reset form
            this.reset();
            
            // Show success message
            showNotification('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    });
}

// Form validation
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Por favor ingresa un email válido');
    }
    
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Por favor ingresa un teléfono válido');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('El mensaje debe tener al menos 10 caracteres');
    }
    
    if (errors.length > 0) {
        showNotification(errors.join('\n'), 'error');
        return false;
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (basic)
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-$$$$]{10,}$/;
    return phoneRegex.test(phone);
}

// Notification system
function showNotification(message, type) {
    type = type || 'info';
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification notification--' + type;
    notification.innerHTML = 
        '<div class="notification__content">' +
            '<span class="notification__message">' + message + '</span>' +
            '<button class="notification__close" aria-label="Cerrar notificación">&times;</button>' +
        '</div>';
    
    // Add styles
    const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';
    notification.style.cssText = 
        'position: fixed;' +
        'top: 20px;' +
        'right: 20px;' +
        'background: ' + bgColor + ';' +
        'color: white;' +
        'padding: 16px 20px;' +
        'border-radius: 8px;' +
        'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);' +
        'z-index: 10000;' +
        'max-width: 400px;' +
        'animation: slideIn 0.3s ease;' +
        'font-family: inherit;';
    
    // Add animation styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = 
            '@keyframes slideIn {' +
                'from {' +
                    'transform: translateX(100%);' +
                    'opacity: 0;' +
                '}' +
                'to {' +
                    'transform: translateX(0);' +
                    'opacity: 1;' +
                '}' +
            '}' +
            '.notification__content {' +
                'display: flex;' +
                'align-items: center;' +
                'justify-content: space-between;' +
                'gap: 12px;' +
            '}' +
            '.notification__message {' +
                'white-space: pre-line;' +
                'line-height: 1.4;' +
            '}' +
            '.notification__close {' +
                'background: none;' +
                'border: none;' +
                'color: white;' +
                'font-size: 20px;' +
                'cursor: pointer;' +
                'padding: 0;' +
                'width: 24px;' +
                'height: 24px;' +
                'display: flex;' +
                'align-items: center;' +
                'justify-content: center;' +
                'border-radius: 50%;' +
                'transition: background-color 0.2s;' +
            '}' +
            '.notification__close:hover {' +
                'background-color: rgba(255, 255, 255, 0.2);' +
            '}';
        
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeButton = notification.querySelector('.notification__close');
    closeButton.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.service__card, .team__card, .about__stat, .contact__card'
    );
    
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Add CSS for scroll animations
function addScrollAnimationStyles() {
    if (!document.querySelector('#scroll-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'scroll-animation-styles';
        style.textContent = 
            '.service__card,' +
            '.team__card,' +
            '.about__stat,' +
            '.contact__card {' +
                'opacity: 0;' +
                'transform: translateY(30px);' +
                'transition: opacity 0.6s ease, transform 0.6s ease;' +
            '}' +
            '.service__card.animate-in,' +
            '.team__card.animate-in,' +
            '.about__stat.animate-in,' +
            '.contact__card.animate-in {' +
                'opacity: 1;' +
                'transform: translateY(0);' +
            '}' +
            '.service__card:nth-child(2) { transition-delay: 0.1s; }' +
            '.service__card:nth-child(3) { transition-delay: 0.2s; }' +
            '.service__card:nth-child(4) { transition-delay: 0.3s; }' +
            '.service__card:nth-child(5) { transition-delay: 0.4s; }' +
            '.service__card:nth-child(6) { transition-delay: 0.5s; }' +
            '.team__card:nth-child(2) { transition-delay: 0.2s; }' +
            '.team__card:nth-child(3) { transition-delay: 0.4s; }' +
            '.about__stat:nth-child(2) { transition-delay: 0.1s; }' +
            '.about__stat:nth-child(3) { transition-delay: 0.2s; }';
        
        document.head.appendChild(style);
    }
}

// Create back to top button
function createBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Volver arriba');
    
    backToTopBtn.style.cssText = 
        'position: fixed;' +
        'bottom: 20px;' +
        'right: 20px;' +
        'width: 50px;' +
        'height: 50px;' +
        'background-color: var(--primary-color, #B8860B);' +
        'color: white;' +
        'border: none;' +
        'border-radius: 50%;' +
        'font-size: 20px;' +
        'cursor: pointer;' +
        'display: none;' +
        'z-index: 1000;' +
        'transition: all 0.3s ease;' +
        'box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);';
    
    backToTopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.backgroundColor = 'var(--primary-dark, #8B6914)';
    });
    
    backToTopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.backgroundColor = 'var(--primary-color, #B8860B)';
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    }, 100));
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll animations
    addScrollAnimationStyles();
    initScrollAnimations();
    
    // Create back to top button
    createBackToTopButton();
    
    // Set initial active link
    highlightActiveLink();
    
    // Add loading class to images for better UX
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
    });
    
    console.log('Golden Clínica Dental website loaded successfully');
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Close mobile menu with Escape key
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('show-menu')) {
        navMenu.classList.remove('show-menu');
        document.body.style.overflow = 'auto';
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
        const args = arguments;
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHeader = debounce(scrollHeader, 10);
const debouncedHighlightActiveLink = debounce(highlightActiveLink, 10);

// Remove original scroll listeners and add debounced ones
window.removeEventListener('scroll', scrollHeader);
window.removeEventListener('scroll', highlightActiveLink);
window.addEventListener('scroll', debouncedScrollHeader);
window.addEventListener('scroll', debouncedHighlightActiveLink);