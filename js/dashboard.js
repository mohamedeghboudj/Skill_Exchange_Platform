
// Counter animation for dashboard statistics
function startCounterAnimation() {
    const counters = document.querySelectorAll('.stat-value');
    const speed = 100;
    
    counters.forEach(counter => {
        const originalText = counter.textContent;
        let targetNumber;
        
        if (originalText.includes('$')) {
            targetNumber = parseInt(originalText.replace('$', '').replace(/,/g, ''));
        } else {
            targetNumber = parseInt(originalText.replace(/,/g, ''));
        }
        
        if (isNaN(targetNumber)) return;
        
        counter.setAttribute('data-target', targetNumber);
        
        if (originalText.includes('$')) {
            counter.textContent = '$0';
        } else {
            counter.textContent = '0';
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(counter);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
    
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const hasDollar = element.textContent.includes('$');
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            const formattedNumber = Math.floor(current).toLocaleString();
            
            if (hasDollar) {
                element.textContent = '$' + formattedNumber;
            } else {
                element.textContent = formattedNumber;
            }
        }, 30);
    }
}

// Teacher management functionality
function setupTeacherManagement() {
    // Sample teacher data - in real app, this would come from an API
    const teachers = [
        { id: 1, name: "Sara Ahmed", email: "sara.ahmed@example.com", link: "/teacher-profile/sara-ahmed" },
        { id: 2, name: "James Lee", email: "james.lee@example.com", link: "/teacher-profile/james-lee" },
        { id: 3, name: "Maria Gonzalez", email: "maria.g@example.com", link: "/teacher-profile/maria-gonzalez" }
    ];
    
    const teacherContainer = document.querySelector('.teacher-management');
    const totalTeachersElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
    
    // Create teacher cards
    function createTeacherCards() {
        // Clear existing cards except the first one (if it exists as template)
        const existingCards = document.querySelectorAll('.teacher-card');
        existingCards.forEach(card => {
            if (card !== existingCards[0]) {
                card.remove();
            }
        });
        
        // Use first card as template or create new ones
        teachers.forEach(teacher => {
            const teacherCard = document.createElement('article');
            teacherCard.className = 'teacher-card';
            teacherCard.dataset.id = teacher.id;
            
            teacherCard.innerHTML = `
                <div class="teacher-info">
                    <h4 class="teacher-name">${teacher.name}</h4>
                    <p class="teacher-email">${teacher.email}</p>
                </div>
                <div class="teacher-actions">
                    <button type="button" class="btn-approve" data-id="${teacher.id}">Approve</button>
                    <button type="button" class="btn-reject" data-id="${teacher.id}">Reject</button>
                </div>
            `;
            
            // Make entire card clickable (except buttons)
            teacherCard.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (!e.target.closest('.teacher-actions')) {
                    // Navigate to teacher profile/link
                    console.log(`Navigating to: ${teacher.link}`);
                    // In production, use: window.location.href = teacher.link;
                    // For demo, show alert
                    alert(`Would navigate to: ${teacher.link}\nIn production, this would open the teacher's detailed request.`);
                }
            });
            
            // Add hover effect for clickable area
            teacherCard.style.cursor = 'pointer';
            teacherCard.addEventListener('mouseenter', () => {
                teacherCard.style.backgroundColor = '#f8fafc';
                teacherCard.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            });
            
            teacherCard.addEventListener('mouseleave', () => {
                teacherCard.style.backgroundColor = '';
                teacherCard.style.boxShadow = '';
            });
            
            // Insert after subtitle
            const subtitle = document.querySelector('.subtitle');
            if (subtitle) {
                subtitle.insertAdjacentElement('afterend', teacherCard);
            } else {
                teacherContainer.appendChild(teacherCard);
            }
        });
    }
    
    // Handle approve button click
    function handleApprove(teacherId) {
        const teacherIndex = teachers.findIndex(t => t.id === parseInt(teacherId));
        if (teacherIndex !== -1) {
            // Remove teacher from pending list
            teachers.splice(teacherIndex, 1);
            
            // Update total teachers count
            const currentTotal = parseInt(totalTeachersElement.textContent.replace(/,/g, ''));
            const newTotal = currentTotal + 1;
            totalTeachersElement.textContent = newTotal.toLocaleString();
            
            // Remove card from UI
            const cardToRemove = document.querySelector(`.teacher-card[data-id="${teacherId}"]`);
            if (cardToRemove) {
                cardToRemove.style.opacity = '0';
                cardToRemove.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    cardToRemove.remove();
                    createTeacherCards(); // Re-render remaining cards
                }, 300);
            }
            
            // Show success message
            showNotification('Teacher approved successfully!', 'success');
        }
    }
    
    // Handle reject button click
    function handleReject(teacherId) {
        const teacherIndex = teachers.findIndex(t => t.id === parseInt(teacherId));
        if (teacherIndex !== -1) {
            // Remove teacher from pending list
            teachers.splice(teacherIndex, 1);
            
            // Remove card from UI with animation
            const cardToRemove = document.querySelector(`.teacher-card[data-id="${teacherId}"]`);
            if (cardToRemove) {
                cardToRemove.style.opacity = '0';
                cardToRemove.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    cardToRemove.remove();
                    createTeacherCards(); // Re-render remaining cards
                }, 300);
            }
            
            // Show rejection message
            showNotification('Teacher request rejected.', 'error');
        }
    }
    
    // Add event delegation for buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-approve')) {
            e.stopPropagation(); // Prevent card click event
            const teacherId = e.target.dataset.id;
            handleApprove(teacherId);
        }
        
        if (e.target.classList.contains('btn-reject')) {
            e.stopPropagation(); // Prevent card click event
            const teacherId = e.target.dataset.id;
            handleReject(teacherId);
        }
    });
    
    // Notification function
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '6px';
        notification.style.color = 'white';
        notification.style.fontSize = '14px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#22c55e';
        } else {
            notification.style.backgroundColor = '#ef4444';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Initialize teacher cards
    createTeacherCards();
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    startCounterAnimation();
    setupTeacherManagement();
    
    // Add some CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .teacher-card {
            transition: all 0.3s ease;
        }
        .notification {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
    `;
    document.head.appendChild(style);
});
