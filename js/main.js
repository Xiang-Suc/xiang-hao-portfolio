// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initTypewriter();
    initCustomCursor();
    initProjectFilters();
    initScrollAnimations();
    initContactForm();
    createTechParticles();
    handleMissingProjectImages();
    makeProjectCardsClickable();
});

// Navbar functionality
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');

    // Change navbar style on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Typewriter effect
function initTypewriter() {
    const elements = document.querySelectorAll('.txt-rotate');
    elements.forEach(element => {
        const toRotate = JSON.parse(element.getAttribute('data-rotate'));
        const period = element.getAttribute('data-period');
        if (toRotate) {
            new Typewriter(element, toRotate, JSON.parse(period));
        }
    });
}

class Typewriter {
    constructor(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.isDeleting = false;
        this.tick();
    }

    tick() {
        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.textContent = this.txt;

        let delta = 200 - Math.random() * 100;

        if (this.isDeleting) {
            delta /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout(() => {
            this.tick();
        }, delta);
    }
}

// Custom cursor
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, button, .project-card, .interest-card, .certificate-item');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorFollower.style.width = '45px';
            cursorFollower.style.height = '45px';
            cursorFollower.style.backgroundColor = 'rgba(255, 58, 47, 0.3)';
        });

        link.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorFollower.style.width = '30px';
            cursorFollower.style.height = '30px';
            cursorFollower.style.backgroundColor = 'rgba(255, 58, 47, 0.2)';
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseout', (e) => {
        if (e.relatedTarget === null) {
            cursor.style.opacity = '0';
            cursorFollower.style.opacity = '0';
        }
    });

    document.addEventListener('mouseover', () => {
        cursor.style.opacity = '1';
        cursorFollower.style.opacity = '1';
    });
}

// Project filter functionality
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            // Filter projects
            projects.forEach(project => {
                const categories = project.getAttribute('data-category').split(' ');
                
                if (filter === 'all' || categories.includes(filter)) {
                    project.style.display = 'block';
                    setTimeout(() => {
                        project.style.opacity = '1';
                        project.style.transform = 'translateY(0)';
                    }, 200);
                } else {
                    project.style.opacity = '0';
                    project.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        project.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Highlight nav link based on scroll position
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Animate elements on scroll
    const elementsToAnimate = document.querySelectorAll('.section-header, .timeline-item, .project-card, .certificate-item, .contact-form');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            } else {
                entry.target.classList.remove('animate');
            }
        });
    }, { threshold: 0.2 });

    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Contact form functionality
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Basic validation
            if (!name || !email || !message) {
                formStatus.textContent = 'Please fill in all fields';
                formStatus.className = 'error-message';
                return;
            }
            
            // Update button state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Prepare template parameters for EmailJS
            const templateParams = {
                from_name: name,
                from_email: email,
                message: message,
                to_name: 'Xiang Hao',
                to_email: 'xianghao98520@gmail.com'
            };
            
            console.log('Sending email with params:', templateParams);
            
            // Send email using EmailJS
            emailjs.send('service_f36ex1c', 'template_6ulbp3e', templateParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    form.reset();
                    
                    // Show success message
                    formStatus.textContent = 'Your message has been sent successfully!';
                    formStatus.className = 'success-message';
                    
                    submitBtn.textContent = 'Message Sent!';
                    
                    // Reset button after a delay
                    setTimeout(() => {
                        submitBtn.textContent = 'Send Message';
                        submitBtn.disabled = false;
                        
                        // Clear status after some time
                        setTimeout(() => {
                            formStatus.textContent = '';
                            formStatus.className = '';
                        }, 3000);
                    }, 3000);
                })
                .catch(function(error) {
                    console.error('FAILED...', error);
                    
                    // Show detailed error message
                    formStatus.textContent = 'Failed to send message: ' + (error.message || 'Unknown error');
                    formStatus.className = 'error-message';
                    
                    submitBtn.textContent = 'Send Message';
                    submitBtn.disabled = false;
                });
        });
    } else {
        console.error('Contact form element not found!');
    }
}

// Create tech-related particles in the hero section
function createTechParticles() {
    const particlesContainer = document.querySelector('.tech-particles');
    const particlesCount = 50;
    
    if (particlesContainer) {
        for (let i = 0; i < particlesCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Randomize particle properties
            const size = Math.random() * 5 + 2 + 'px';
            const posX = Math.random() * 100 + '%';
            const posY = Math.random() * 100 + '%';
            const duration = Math.random() * 20 + 10 + 's';
            const delay = Math.random() * 5 + 's';
            
            // Set particle style
            particle.style.width = size;
            particle.style.height = size;
            particle.style.left = posX;
            particle.style.top = posY;
            particle.style.animationDuration = duration;
            particle.style.animationDelay = delay;
            
            // Add particle to container
            particlesContainer.appendChild(particle);
        }
    }
}

// Create tech grid background for the hero section
document.addEventListener('DOMContentLoaded', () => {
    // Create SVG for tech grid background
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    `;
    
    // Create a blob for the grid
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Set the tech grid as background image
    document.querySelector('.hero-section').style.backgroundImage = `url(${url})`;
    
    // Clean up the URL object when done
    window.addEventListener('unload', () => URL.revokeObjectURL(url));
});

// Add additional styles for animations
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .particle {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            animation: particleFloat linear infinite, particleFade 5s ease-in-out infinite;
        }
        
        @keyframes particleFloat {
            0% {
                transform: translateY(0) translateX(0);
            }
            25% {
                transform: translateY(-30px) translateX(15px);
            }
            50% {
                transform: translateY(-60px) translateX(0);
            }
            75% {
                transform: translateY(-30px) translateX(-15px);
            }
            100% {
                transform: translateY(0) translateX(0);
            }
        }
        
        @keyframes particleFade {
            0%, 100% {
                opacity: 0;
            }
            50% {
                opacity: 0.8;
            }
        }
        
        .section-header, .timeline-item, .project-card, .certificate-item, .contact-form {
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.6s ease-out;
        }
        
        .section-header.animate, .timeline-item.animate, .project-card.animate, .certificate-item.animate, .contact-form.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .success-message {
            background-color: rgba(0, 200, 0, 0.2);
            color: #00aa00;
            padding: 10px;
            margin-top: 20px;
            border-radius: 5px;
            text-align: center;
            transition: opacity 0.3s ease;
        }
        
        .hamburger.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }
        
        .hamburger.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    `;
    document.head.appendChild(style);
});

// Handle missing project images
function handleMissingProjectImages() {
    const projectImages = document.querySelectorAll('.project-img img');
    
    projectImages.forEach(img => {
        img.onerror = function() {
            // Replace with a colored placeholder with the project name
            const projectName = this.closest('.project-card').querySelector('h3').textContent;
            const colors = [
                '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
                '#9b59b6', '#1abc9c', '#d35400', '#2c3e50'
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = randomColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add project name
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Wrap text if needed
            const words = projectName.split(' ');
            let line = '';
            let lines = [];
            let y = canvas.height / 2 - (words.length > 3 ? 20 : 0);
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                if (testLine.length > 15 && i > 0) {
                    lines.push(line);
                    line = words[i] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
            
            lines.forEach((l, i) => {
                ctx.fillText(l, canvas.width / 2, y + (i * 40));
            });
            
            // Replace the image
            this.src = canvas.toDataURL('image/png');
        };
    });
}

// Make project cards clickable
function makeProjectCardsClickable() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // If clicking on the GitHub link, don't navigate to project detail
            if (e.target.closest('.project-link') || e.target.closest('.project-links')) {
                return;
            }
            
            const projectTitle = this.querySelector('h3').textContent;
            let projectUrl;
            
            switch(projectTitle) {
                case 'Covid-19 Infection Rate Tracker':
                    projectUrl = 'projects/covid-tracker.html';
                    break;
                case 'Global Development Insights Dashboard':
                    projectUrl = 'projects/global-dashboard.html';
                    break;
                case 'House Price Prediction':
                    projectUrl = 'projects/house-price.html';
                    break;
                case 'Cold Call System':
                    projectUrl = 'projects/cold-call.html';
                    break;
                case 'Karting Game':
                    projectUrl = 'projects/karting-game.html';
                    break;
                case 'Time Tracker':
                    projectUrl = 'projects/time-tracker.html';
                    break;
                default:
                    return; // If project doesn't have a detail page yet
            }
            
            window.location.href = projectUrl;
        });
    });
} 