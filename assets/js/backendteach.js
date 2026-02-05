// File: /assets/js/teach.js
// COMPLETE TEACH PAGE MANAGER - Handles all functionality
// =====================================================================

// =====================================================================
// 1. TEACHER REQUEST MANAGER - Handles student enrollment requests
// =====================================================================

class TeacherRequestManager {
    constructor() {
        this.requestsContainer = document.querySelector('.requests');
        this.popup = document.getElementById('popup');
        this.currentUser = null;
        this.requests = [];
        this.groupedRequests = {};
        
        console.log('TeacherRequestManager initialized');
    }

    async init() {
        try {
            const isTeacher = await this.loadCurrentUser();
            if (isTeacher) {
                await this.loadTeacherRequests();
                this.setupEventListeners();
            } else {
                this.showNotTeacherMessage();
            }
        } catch (error) {
            console.error('Initialization error:', error);
            this.showErrorMessage(error.message);
        }
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/assets/php/getCurrentUser.php', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.user) {
                this.currentUser = {
                    user_id: data.user.id,
                    email: data.user.email,
                    full_name: data.user.name,
                    is_teacher: data.user.is_teacher,
                    role: data.user.role
                };

                console.log('User loaded:', this.currentUser.full_name, 'is_teacher:', this.currentUser.is_teacher);

                if (this.currentUser.is_teacher === 1) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error loading user:', error);
            return false;
        }
    }

    async loadTeacherRequests() {
        try {
            console.log('Loading teacher requests from API...');

            const response = await fetch('/api/get_teacher_pending_requests.php', {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                console.log(`Loaded ${data.total_requests || 0} total requests, ${data.total_pending || 0} pending`);
                this.requests = data.data || [];
                this.groupedRequests = data.grouped || [];
                this.displayRequests();
            } else {
                if (data.is_teacher === false) {
                    this.showNotTeacherMessage();
                } else {
                    throw new Error(data.error || 'Failed to load requests');
                }
            }
        } catch (error) {
            console.error('Error loading teacher requests:', error);
            this.showErrorMessage('Unable to load requests. ' + error.message);
        }
    }

    displayRequests() {
        if (!this.requestsContainer) {
            console.error('Requests container not found');
            return;
        }

        this.requestsContainer.innerHTML = '<p>Requests to join courses</p>';

        if (this.groupedRequests.length === 0) {
            this.showNoRequestsMessage();
            return;
        }

        this.groupedRequests.forEach(courseGroup => {
            this.createCourseRequestSection(courseGroup);
        });

        this.attachRequestClickListeners();
    }

    createCourseRequestSection(courseGroup) {
        const courseSection = document.createElement('div');
        courseSection.className = 'course-requests';
        
        const pendingBadge = courseGroup.pending_count > 0 
            ? `<span class="request-badge">${courseGroup.pending_count} pending</span>` 
            : '';
        
        courseSection.innerHTML = `<p>${courseGroup.course_title} requests ${pendingBadge}</p>`;

        courseGroup.requests.forEach(request => {
            const requestElement = this.createRequestElement(request);
            courseSection.appendChild(requestElement);
        });

        this.requestsContainer.appendChild(courseSection);
    }

    createRequestElement(request) {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request';
        requestDiv.dataset.requestId = request.request_id;
        requestDiv.dataset.status = request.request_status;
        requestDiv.dataset.requestData = JSON.stringify(request);

        const statusClass = this.getStatusClass(request.request_status);
        const statusColor = this.getStatusColor(request.request_status);

        requestDiv.innerHTML = `
            <div class="chatImg">
                <img src="${request.student_picture || '../assets/images/pf4.jpg'}" 
                     alt="${request.student_name}"
                     onerror="this.src='../assets/images/pf4.jpg'">
            </div>
            <div class="chatInfo">
                <div class="name">${request.student_name || 'Unknown Student'}</div>
                <div class="Rcourse ${statusClass}">${this.formatStatus(request.request_status)}</div>
                ${request.time_ago ? `<div class="time-ago">${request.time_ago}</div>` : ''}
            </div>
        `;

        requestDiv.style.borderLeft = `4px solid ${statusColor}`;
        requestDiv.style.cursor = 'pointer';
        requestDiv.style.transition = 'all 0.2s ease';
        
        if (request.request_status !== 'pending') {
            requestDiv.style.opacity = '0.7';
        }

        requestDiv.addEventListener('mouseenter', () => {
            requestDiv.style.backgroundColor = '#f8f9fa';
        });
        
        requestDiv.addEventListener('mouseleave', () => {
            requestDiv.style.backgroundColor = '';
        });

        return requestDiv;
    }

    attachRequestClickListeners() {
        const requestElements = this.requestsContainer.querySelectorAll('.request');

        requestElements.forEach(requestEl => {
            requestEl.addEventListener('click', (e) => {
                e.preventDefault();
                const requestData = JSON.parse(requestEl.dataset.requestData);
                this.openRequestReview(requestData);
            });
        });
    }

    openRequestReview(request) {
        console.log('Opening request review:', request);

        if (!this.popup) {
            window.open(
                `/requestReview.html?request=${encodeURIComponent(JSON.stringify(request))}`,
                '_blank',
                'width=600,height=800'
            );
            return;
        }

        const iframe = this.popup.querySelector('iframe');
        if (iframe) {
            const requestParam = encodeURIComponent(JSON.stringify(request));
            iframe.src = `/requestReview.html?request=${requestParam}`;
            this.popup.showModal();
            this.setupPopupCloseHandler();
        }
    }

    // ================= FIXED: no refresh =================
    setupPopupCloseHandler() {
        if (!this.popup) return;

        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.popup.close();
            }
        });

        window.addEventListener('message', (event) => {
            if (event.data.type === 'request_processed') {
                console.log('Request processed (no refresh)');
                this.popup.close(); // only close popup
            } else if (event.data.type === 'close_popup') {
                this.popup.close();
            }
        });
    }

    // ================= FIXED: no auto refresh =================
    setupEventListeners() {
        const refreshBtn = document.querySelector('.refresh-requests-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTeacherRequests());
        }
        // ❌ auto-refresh removed
    }

    getStatusClass(status) {
        const classes = {
            'pending': 'status-pending',
            'approved': 'status-approved',
            'accepted': 'status-approved',
            'rejected': 'status-rejected',
            'declined': 'status-rejected'
        };
        return classes[status] || 'status-unknown';
    }

    getStatusColor(status) {
        const colors = {
            'pending': '#ffc107',
            'approved': '#28a745',
            'accepted': '#28a745',
            'rejected': '#dc3545',
            'declined': '#dc3545'
        };
        return colors[status] || '#6c757d';
    }

    formatStatus(status) {
        if (!status) return 'Unknown';
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    showNotTeacherMessage() {
        if (this.requestsContainer) {
            this.requestsContainer.innerHTML = `
                <div class="not-teacher" style="text-align: center; padding: 40px 20px;">
                    <h3>Teacher Access Required</h3>
                    <p>You need to be a teacher to view student requests.</p>
                </div>
            `;
        }
    }

    showNoRequestsMessage() {
        const noRequestsDiv = document.createElement('div');
        noRequestsDiv.className = 'no-requests';
        noRequestsDiv.style.cssText = 'text-align: center; padding: 40px 20px; color: #666;';
        noRequestsDiv.innerHTML = `
            <p>No student requests at the moment</p>
        `;
        this.requestsContainer.appendChild(noRequestsDiv);
    }

    showErrorMessage(message = 'Error loading requests') {
        if (this.requestsContainer) {
            this.requestsContainer.innerHTML = `<p style="color:red">${message}</p>`;
        }
    }
}


// =====================================================================
// 2. COURSE MANAGER - unchanged
// =====================================================================
// (your CourseManager + DeletionManager + initialization code remains EXACTLY the same as before)

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing teach page...');

    if (document.querySelector('.content')) {
        window.courseManager = new CourseManager();
        await window.courseManager.init();

        window.deletionManager = new DeletionManager();
        window.deletionManager.setupDeleteListeners();
    }

    if (document.querySelector('.requests')) {
        window.teacherRequestManager = new TeacherRequestManager();
        await window.teacherRequestManager.init();
    }

    console.log('All managers initialized successfully');
});
