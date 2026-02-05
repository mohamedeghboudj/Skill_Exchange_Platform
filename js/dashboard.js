
// Counter animation for dashboard statistics
/*function startCounterAnimation() {
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
});*/  //omayma's code commented by ikram

// Fetch dashboard statistics from database
function fetchDashboardStats() {
    fetch('/assets/php/fetch_dashboard_stats.php')
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error('Error fetching stats:', data.error);
                return;
            }

            // Update the stat values in the HTML with actual data
            const statCards = document.querySelectorAll('.stat-card .stat-value');
            statCards[0].textContent = data.totalUsers.toLocaleString();
            statCards[1].textContent = data.totalTeachers.toLocaleString();
            statCards[2].textContent = data.totalCourses.toLocaleString();

            // Update revenue statistics
            const revenueItems = document.querySelectorAll('.revenue-stats li span:last-child');
            revenueItems[0].textContent = '$' + Math.floor(data.monthlyRecurring).toLocaleString();
            revenueItems[1].textContent = '$' + Math.floor(data.revenueThisMonth).toLocaleString();
            revenueItems[2].textContent = '$' + Math.floor(data.payoutsPending).toLocaleString();

            // NOW start counter animation after data is loaded
            setTimeout(() => {
                startCounterAnimation();
            }, 100);
        })
        .catch(err => {
            console.error('Error loading dashboard stats:', err);
            // Even on error, try to animate the default values
            setTimeout(() => {
                startCounterAnimation();
            }, 100);
        });
}

// Counter animation for dashboard statistics
function startCounterAnimation() {
    const counters = document.querySelectorAll('.stat-value');

    counters.forEach(counter => {
        const originalText = counter.textContent;
        let targetNumber;

        // Parse the target number
        if (originalText.includes('$')) {
            targetNumber = parseInt(originalText.replace('$', '').replace(/,/g, ''));
        } else {
            targetNumber = parseInt(originalText.replace(/,/g, ''));
        }

        if (isNaN(targetNumber) || targetNumber === 0) return;

        // Store target in data attribute
        counter.setAttribute('data-target', targetNumber);

        // Reset to 0 before animating
        if (originalText.includes('$')) {
            counter.textContent = '$0';
        } else {
            counter.textContent = '0';
        }
    });

    // Add observer for animation on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                // Only animate if not already animated
                if (!counter.classList.contains('animated')) {
                    counter.classList.add('animated');
                    animateCounter(counter);
                    observer.unobserve(counter);
                }
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
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
    const teacherContainer = document.querySelector('.teacher-management');
    let teachers = [];
    let expandedRequestId = null;

    // Fetch teacher requests from database
    function fetchTeacherRequests() {
        fetch('/assets/php/fetch_teacher_requests.php')
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error('Error fetching teacher requests:', data.error);
                    return;
                }
                teachers = data;
                createTeacherCards();
            })
            .catch(err => console.error('Error loading teacher requests:', err));
    }

    // Create teacher cards
    function createTeacherCards() {
        // Clear existing cards
        const existingCards = document.querySelectorAll('.teacher-card');
        existingCards.forEach(card => card.remove());

        // Clear existing details boxes
        const existingDetails = document.querySelectorAll('.teacher-details-box');
        existingDetails.forEach(detail => detail.remove());

        if (teachers.length === 0) {
            const subtitle = document.querySelector('.subtitle');
            const noRequestsMsg = document.createElement('p');
            noRequestsMsg.className = 'no-requests';
            noRequestsMsg.textContent = 'No pending teacher requests at this time.';
            noRequestsMsg.style.color = '#94a3b8';
            noRequestsMsg.style.fontSize = '14px';
            noRequestsMsg.style.marginTop = '16px';

            // Remove any existing "no requests" message
            const existingMsg = document.querySelector('.no-requests');
            if (existingMsg) existingMsg.remove();

            subtitle.insertAdjacentElement('afterend', noRequestsMsg);
            return;
        }

        // Remove "no requests" message if it exists
        const existingMsg = document.querySelector('.no-requests');
        if (existingMsg) existingMsg.remove();

        teachers.forEach(teacher => {
            const teacherCard = document.createElement('article');
            teacherCard.className = 'teacher-card';
            teacherCard.dataset.id = teacher.id;

            // Determine profile picture
            const profilePic = teacher.profile_picture && teacher.profile_picture.trim() !== ''
                ? teacher.profile_picture
                : '/assets/images/default-avatar.png';

            teacherCard.innerHTML = `
                <div class="teacher-info">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${profilePic}" alt="${teacher.name}" 
                             style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0;">
                        <div>
                            <h4 class="teacher-name">${teacher.name}</h4>
                            <p class="teacher-email">${teacher.email}</p>
                            ${teacher.skill ? `<p style="font-size: 12px; color: #3b82f6; margin-top: 2px;">${teacher.skill}</p>` : ''}
                        </div>
                    </div>
                </div>
                <div class="teacher-actions">
                    <button type="button" class="btn-approve" data-id="${teacher.id}">Approve</button>
                    <button type="button" class="btn-reject" data-id="${teacher.id}">Reject</button>
                </div>
            `;

            // Make entire card clickable (except buttons)
            teacherCard.addEventListener('click', (e) => {
                if (!e.target.closest('.teacher-actions')) {
                    toggleTeacherDetails(teacher, teacherCard);
                }
            });

            // Add hover effect
            teacherCard.style.cursor = 'pointer';
            teacherCard.addEventListener('mouseenter', () => {
                if (expandedRequestId !== teacher.id) {
                    teacherCard.style.backgroundColor = '#f8fafc';
                    teacherCard.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
            });

            teacherCard.addEventListener('mouseleave', () => {
                if (expandedRequestId !== teacher.id) {
                    teacherCard.style.backgroundColor = '';
                    teacherCard.style.boxShadow = '';
                }
            });

            const subtitle = document.querySelector('.subtitle');
            subtitle.insertAdjacentElement('afterend', teacherCard);
        });
    }

    // Toggle teacher details box
    function toggleTeacherDetails(teacher, teacherCard) {
        const existingDetails = document.querySelector('.teacher-details-box');

        // If clicking the same card, close it
        if (expandedRequestId === teacher.id) {
            if (existingDetails) {
                existingDetails.style.maxHeight = '0';
                existingDetails.style.opacity = '0';
                setTimeout(() => {
                    existingDetails.remove();
                }, 300);
            }
            expandedRequestId = null;
            teacherCard.style.backgroundColor = '';
            teacherCard.style.boxShadow = '';
            return;
        }

        // Remove any existing details box
        if (existingDetails) {
            existingDetails.remove();
        }

        // Reset all card backgrounds
        document.querySelectorAll('.teacher-card').forEach(card => {
            card.style.backgroundColor = '';
            card.style.boxShadow = '';
        });

        // Highlight the selected card
        teacherCard.style.backgroundColor = '#f1f5f9';
        teacherCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

        // Create details box
        const detailsBox = document.createElement('div');
        detailsBox.className = 'teacher-details-box';
        detailsBox.dataset.id = teacher.id;

        // Prepare certificate display
        let certificateHtml = '';
        if (teacher.certificate_url && teacher.certificate_url.trim() !== '') {
            const isPdf = teacher.certificate_url.toLowerCase().endsWith('.pdf');
            const fileName = teacher.certificate_url.split('/').pop() || 'Certificate';

            if (isPdf) {
                certificateHtml = `
                <div class="detail-row">
                    <span class="detail-label">Certificate:</span>
                    <a href="${teacher.certificate_url}" target="_blank" class="certificate-link">
                        <div class="certificate-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M14 2V8H20" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M16 13H8" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M16 17H8" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 9H9H8" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="certificate-info">
                            <span class="certificate-name">${fileName}</span>
                            <span class="certificate-source">PDF Document</span>
                        </div>
                    </a>
                </div>
            `;
            } else {
                // For image certificates
                certificateHtml = `
                <div class="detail-row">
                    <span class="detail-label">Certificate:</span>
                    <a href="${teacher.certificate_url}" target="_blank" class="certificate-link">
                        <div class="certificate-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M17 8L12 3L7 8" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 3V15" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="certificate-info">
                            <span class="certificate-name">${fileName}</span>
                            <span class="certificate-source">Image File</span>
                        </div>
                    </a>
                </div>
            `;
            }
        } else {
            certificateHtml = `
            <div class="detail-row">
                <span class="detail-label">Certificate:</span>
                <span class="detail-value" style="color: #94a3b8; font-style: italic;">No certificate provided</span>
            </div>
        `;
        }

        detailsBox.innerHTML = `
        <div class="details-content">
            <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                Request Details
            </h4>
            
            <div class="detail-row">
                <span class="detail-label">Full Name:</span>
                <span class="detail-value">${teacher.name}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${teacher.email}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Primary Skill:</span>
                <span class="detail-value">${teacher.skill || '<span style="color: #94a3b8; font-style: italic;">Not specified</span>'}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Bio:</span>
                <span class="detail-value">${teacher.bio || '<span style="color: #94a3b8; font-style: italic;">No bio provided</span>'}</span>
            </div>
            
            ${certificateHtml}
        </div>
    `;

        // Insert after the teacher card
        teacherCard.insertAdjacentElement('afterend', detailsBox);

        // Trigger animation
        setTimeout(() => {
            detailsBox.style.maxHeight = detailsBox.scrollHeight + 'px';
            detailsBox.style.opacity = '1';
        }, 10);

        expandedRequestId = teacher.id;
    }
    // Handle approve button click
    function handleApprove(requestId) {
        if (!confirm('Are you sure you want to approve this teacher request?')) {
            return;
        }

        fetch('/assets/php/approve_teacher.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ request_id: requestId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Remove from local array FIRST
                    const teacherIndex = teachers.findIndex(t => t.id === parseInt(requestId));
                    if (teacherIndex !== -1) {
                        teachers.splice(teacherIndex, 1);
                    }

                    // Remove details box if expanded
                    const detailsBox = document.querySelector(`.teacher-details-box[data-id="${requestId}"]`);
                    if (detailsBox) {
                        detailsBox.style.maxHeight = '0';
                        detailsBox.style.opacity = '0';
                        setTimeout(() => {
                            detailsBox.remove();
                        }, 300);
                    }

                    // Remove card with animation
                    const cardToRemove = document.querySelector(`.teacher-card[data-id="${requestId}"]`);
                    if (cardToRemove) {
                        cardToRemove.style.opacity = '0';
                        cardToRemove.style.transform = 'translateX(-100%)';
                        setTimeout(() => {
                            cardToRemove.remove();

                            // Check if there are no more teachers
                            if (teachers.length === 0) {
                                const subtitle = document.querySelector('.subtitle');
                                const noRequestsMsg = document.createElement('p');
                                noRequestsMsg.className = 'no-requests';
                                noRequestsMsg.textContent = 'No pending teacher requests at this time.';
                                noRequestsMsg.style.color = '#94a3b8';
                                noRequestsMsg.style.fontSize = '14px';
                                noRequestsMsg.style.marginTop = '16px';
                                subtitle.insertAdjacentElement('afterend', noRequestsMsg);
                            }
                        }, 300);
                    }

                    // Reset expanded state
                    expandedRequestId = null;

                    // Update total teachers count
                    const totalTeachersElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
                    const currentTotal = parseInt(totalTeachersElement.textContent.replace(/,/g, ''));
                    totalTeachersElement.textContent = (currentTotal + 1).toLocaleString();

                    showNotification('Teacher approved successfully!', 'success');
                } else {
                    showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(err => {
                console.error('Error approving teacher:', err);
                showNotification('Failed to approve teacher. Please try again.', 'error');
            });
    }

    // Handle reject button click
    function handleReject(requestId) {
        if (!confirm('Are you sure you want to reject this teacher request?')) {
            return;
        }

        fetch('/assets/php/reject_teacher.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ request_id: requestId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Remove from local array FIRST
                    const teacherIndex = teachers.findIndex(t => t.id === parseInt(requestId));
                    if (teacherIndex !== -1) {
                        teachers.splice(teacherIndex, 1);
                    }

                    // Remove details box if expanded
                    const detailsBox = document.querySelector(`.teacher-details-box[data-id="${requestId}"]`);
                    if (detailsBox) {
                        detailsBox.style.maxHeight = '0';
                        detailsBox.style.opacity = '0';
                        setTimeout(() => {
                            detailsBox.remove();
                        }, 300);
                    }

                    // Remove card with animation
                    const cardToRemove = document.querySelector(`.teacher-card[data-id="${requestId}"]`);
                    if (cardToRemove) {
                        cardToRemove.style.opacity = '0';
                        cardToRemove.style.transform = 'translateX(100%)';
                        setTimeout(() => {
                            cardToRemove.remove();

                            // Check if there are no more teachers
                            if (teachers.length === 0) {
                                const subtitle = document.querySelector('.subtitle');
                                const noRequestsMsg = document.createElement('p');
                                noRequestsMsg.className = 'no-requests';
                                noRequestsMsg.textContent = 'No pending teacher requests at this time.';
                                noRequestsMsg.style.color = '#94a3b8';
                                noRequestsMsg.style.fontSize = '14px';
                                noRequestsMsg.style.marginTop = '16px';
                                subtitle.insertAdjacentElement('afterend', noRequestsMsg);
                            }
                        }, 300);
                    }

                    // Reset expanded state
                    expandedRequestId = null;

                    showNotification('Teacher request rejected', 'error');
                } else {
                    showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(err => {
                console.error('Error rejecting teacher:', err);
                showNotification('Failed to reject teacher. Please try again.', 'error');
            });
    }

    // Add event delegation for buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-approve')) {
            e.stopPropagation();
            const requestId = e.target.dataset.id;
            handleApprove(requestId);
        }

        if (e.target.classList.contains('btn-reject')) {
            e.stopPropagation();
            const requestId = e.target.dataset.id;
            handleReject(requestId);
        }
    });

    // Notification function
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

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

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Initialize teacher requests
    fetchTeacherRequests();
}
// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Fetch stats first, animation will start after data loads
    fetchDashboardStats();
    setupTeacherManagement();

    // Add CSS for animations and details box
    const style = document.createElement('style');
    style.textContent = `
        .teacher-card {
            transition: all 0.3s ease;
        }
        .notification {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .teacher-details-box {
            background: #dbdbdb;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            margin-top: 8px;
            margin-bottom: 12px;
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: all 0.3s ease;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .details-content {
            padding: 20px;
        }
        .detail-row {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            align-items: center;
        }
        .detail-row:last-child {
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #5a626d;
            font-size: 14px;
            min-width: 130px;
            flex-shrink: 0;
        }
        .detail-value {
            color: #1e293b;
            font-size: 14px;
            line-height: 1.6;
            flex: 1;
        }
        .certificate-link {
            width:250px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.2s;
        }
        .certificate-link:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .certificate-icon {
            width: 40px;
            height: 40px;
            background: #ffffff;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .certificate-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .certificate-name {
            font-size: 14px;
            font-weight: 500;
            color: #1e293b;
        }
        .certificate-source {
            font-size: 12px;
            color: #64748b;
        }
    `;
    document.head.appendChild(style);
});