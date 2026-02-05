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

        // Clear existing content but keep the title
        this.requestsContainer.innerHTML = '<p>Requests to join courses</p>';

        if (this.groupedRequests.length === 0) {
            this.showNoRequestsMessage();
            return;
        }

        // Display requests grouped by course
        this.groupedRequests.forEach(courseGroup => {
            this.createCourseRequestSection(courseGroup);
        });

        // Attach click listeners
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
            console.error('Popup dialog not found');
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

    setupPopupCloseHandler() {
        if (!this.popup) return;

        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.popup.close();
            }
        });

        window.addEventListener('message', (event) => {
            if (event.data.type === 'request_processed') {
                console.log('Request processed, refreshing...');
                this.popup.close();
                this.loadTeacherRequests();
            } else if (event.data.type === 'close_popup') {
                this.popup.close();
            }
        });
    }

    setupEventListeners() {
        const refreshBtn = document.querySelector('.refresh-requests-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTeacherRequests());
        }

        // Auto-refresh every 30 seconds
        setInterval(() => {
            console.log('Auto-refreshing requests...');
            this.loadTeacherRequests();
        }, 30000);
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
                    <h3 style="margin-top: 20px; color: #333;">Teacher Access Required</h3>
                    <p style="color: #666; margin: 10px 0;">You need to be a teacher to view student requests.</p>
                    <a href="/pages/teacherrequest.html" 
                       style="display: inline-block; margin-top: 20px; padding: 12px 24px; 
                              background: linear-gradient(-120deg, rgba(143, 201, 251, 0.301), 20%, #1976d2); 
                              color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Become a Teacher
                    </a>
                </div>
            `;
        }
    }

    showNoRequestsMessage() {
        const noRequestsDiv = document.createElement('div');
        noRequestsDiv.className = 'no-requests';
        noRequestsDiv.style.cssText = 'text-align: center; padding: 40px 20px; color: #666;';
        
        noRequestsDiv.innerHTML = `
            <p style="font-size: 18px; font-weight: 600; margin-top: 20px;">No student requests at the moment</p>
            <p style="font-size: 14px; margin-top: 10px;">When students apply to your courses, their requests will appear here.</p>
        `;
        
        this.requestsContainer.appendChild(noRequestsDiv);
    }

    showErrorMessage(message = 'Error loading requests') {
        if (this.requestsContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = 'text-align: center; padding: 40px 20px; color: #dc3545;';
            
            errorDiv.innerHTML = `
                <p style="font-weight: 600; margin-top: 20px;">${message}</p>
                <button onclick="window.location.reload()" 
                        style="margin-top: 20px; padding: 10px 20px; background: #1976d2; 
                               color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    Retry
                </button>
            `;
            
            this.requestsContainer.appendChild(errorDiv);
        }
    }
}


// =====================================================================
// 2. COURSE MANAGER - Handles course display and management
// =====================================================================

class CourseManager {
    constructor() {
        this.contentContainer = document.querySelector('.content');
        this.currentUser = null;
        this.courses = [];

        console.log('CourseManager initialized');
    }

    async init() {
        try {
            const isTeacher = await this.loadCurrentUser();
            if (!isTeacher) {
                this.showNotTeacherMessage();
                return;
            }

            await this.loadTeacherCourses();
            await this.renderCourses();
        } catch (error) {
            console.error('CourseManager init error:', error);
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
                    is_teacher: data.user.is_teacher
                };
                
                console.log('CourseManager - User loaded:', this.currentUser.full_name);
                return this.currentUser.is_teacher === 1;
            }
            return false;
        } catch (error) {
            console.error('Error loading user:', error);
            return false;
        }
    }

    async loadTeacherCourses() {
        try {
            console.log('Loading teacher courses...');
            const response = await fetch('/api/get_teacher_courses.php', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (Array.isArray(data)) {
                this.courses = data;
            } else if (data.success && Array.isArray(data.data)) {
                this.courses = data.data;
            } else {
                this.courses = [];
            }
            
            console.log(`Loaded ${this.courses.length} courses`);
        } catch (error) {
            console.error('Error loading courses:', error);
            this.courses = [];
        }
    }

    async renderCourses() {
        if (!this.contentContainer) {
            console.error('Content container not found');
            return;
        }

        this.contentContainer.innerHTML = '';

        if (this.courses.length === 0) {
            this.showNoCoursesMessage();
            return;
        }

        for (const course of this.courses) {
            const [videos, assignments] = await Promise.all([
                this.loadCourseVideos(course.course_id),
                this.loadCourseAssignments(course.course_id)
            ]);

            const courseElement = this.createCourseElement(course, videos, assignments);
            this.contentContainer.appendChild(courseElement);
        }

        // After rendering all courses, initialize DeletionManager
        console.log('Courses rendered, initializing DeletionManager...');
        if (window.deletionManager) {
            window.deletionManager.setupDeleteListeners();
        }
    }

    async loadCourseVideos(courseId) {
        try {
            const response = await fetch(`/api/get_videos.php?course_id=${courseId}`, {
                credentials: 'include'
            });
            if (!response.ok) return [];
            
            const data = await response.json();
            return Array.isArray(data) ? data : (data.data || []);
        } catch (error) {
            console.error(`Error loading videos for course ${courseId}:`, error);
            return [];
        }
    }

    async loadCourseAssignments(courseId) {
        try {
            const response = await fetch(`/api/get_assignments.php?course_id=${courseId}`, {
                credentials: 'include'
            });
            if (!response.ok) return [];
            
            const data = await response.json();
            return Array.isArray(data) ? data : (data.data || []);
        } catch (error) {
            console.error(`Error loading assignments for course ${courseId}:`, error);
            return [];
        }
    }

    createCourseElement(course, videos, assignments) {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'course';
        courseDiv.dataset.courseId = course.course_id;

        const durationText = course.duration ? `${course.duration} hours` : 'Not set';
        const priceText = course.price ? `$${parseFloat(course.price).toFixed(2)}` : 'Free';

        courseDiv.innerHTML = `
            <div class="coursename">
                <h3>${course.course_title || 'Untitled Course'}</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="#b7b4b4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-trash2-icon lucide-trash-2 delete-course-btn">
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
            </div>
            
            <div class="course-info" style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <div class="info-row" style="margin: 8px 0;">
                    <span class="label" style="font-weight: 600; color: #666;">Category:</span>
                    <span class="value" style="color: #333;">${course.category || 'Not set'}</span>
                </div>
                <div class="info-row" style="margin: 8px 0;">
                    <span class="label" style="font-weight: 600; color: #666;">Description:</span>
                    <span class="value" style="color: #333;">${course.course_description || 'No description'}</span>
                </div>
                <div class="info-row" style="margin: 8px 0;">
                    <span class="label" style="font-weight: 600; color: #666;">Duration:</span>
                    <span class="value" style="color: #333;">${durationText}</span>
                </div>
                <div class="info-row" style="margin: 8px 0;">
                    <span class="label" style="font-weight: 600; color: #666;">Price:</span>
                    <span class="value" style="color: #333;">${priceText}</span>
                </div>
                <div class="info-row" style="margin: 8px 0;">
                    <span class="label" style="font-weight: 600; color: #666;">Enrolled:</span>
                    <span class="value" style="color: #333;">${course.enrolled_count || 0} students</span>
                </div>
                <div class="info-row" style="margin: 8px 0;">
                    <span class="label" style="font-weight: 600; color: #666;">Rating:</span>
                    <span class="value" style="color: #333;">${course.rating ? `${course.rating}/5.0` : 'Not rated'}</span>
                </div>
            </div>

            <div class="videos">
                <div class="vdHead">
                    <p>Course Videos (${videos.length})</p>
                    <div class="edit-buttons">
                        <button class="deletebtn delete-videos-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m15 9-6 6" />
                                <path d="m9 9 6 6" />
                            </svg>
                            delete
                        </button>
                        <button class="addVd add-video-btn" data-course-id="${course.course_id}">
                            + Add
                        </button>
                    </div>
                </div>
                <div class="vdcards">
                    ${videos.length > 0 ?
                        videos.map(v => `
                            <div class="video" data-video-id="${v.video_id}">
                                <div class="one">
                                    <div class="vd-background">
                                        <img src="../assets/images/webdev.jpg" alt="Video">
                                    </div>
                                    <div class="vd-info">
                                        <div class="title">${v.video_title}</div>
                                        ${v.video_url ? `<a href="${v.video_url}" target="_blank" class="video-link" style="font-size: 12px; color: #1976d2;">View</a>` : ''}
                                    </div>
                                </div>
                                <div class="two">
                                    <input type="checkbox" class="video-checkbox" data-video-id="${v.video_id}" style="display: none;">
                                </div>
                            </div>
                        `).join('') :
                        '<p style="color: #999; font-style: italic;">No videos yet</p>'
                    }
                </div>
            </div>

            <div class="assignments">
                <p>Assignments (${assignments.length})</p>
                ${assignments.length > 0 ?
                    assignments.map(a => `
                        <div class="assignment" data-assignment-id="${a.assignment_id}">
                            <div class="pdf assignment-file" data-file-url="${a.assignment_url || ''}" style="cursor: pointer;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-file-icon lucide-file">
                                    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                </svg>
                                ${a.assignment_title}
                            </div>
                            <div class="edit-buttons">
                                <button class="deletebtn delete-assignment-btn" data-assignment-id="${a.assignment_id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="m15 9-6 6" />
                                        <path d="m9 9 6 6" />
                                    </svg>
                                    delete
                                </button>
                            </div>
                        </div>
                    `).join('') :
                    '<p style="color: #999; font-style: italic;">No assignments yet</p>'
                }
                <div class="add-assignment-container" style="margin-top: 10px;">
                    <button class="addAss add-assignment-btn" data-course-id="${course.course_id}">
                        + Add Assignment
                    </button>
                </div>
            </div>
        `;

        return courseDiv;
    }

    showNoCoursesMessage() {
        this.contentContainer.innerHTML = `
            <div class="no-courses" style="text-align: center; padding: 60px 20px;">
                <h3 style="color: #333; margin-bottom: 15px;">No Courses Yet</h3>
                <p style="color: #666; margin-bottom: 25px;">You haven't created any courses.</p>
                <a href="/html/addcourse.html" 
                   style="display: inline-block; padding: 12px 24px; 
                          background: linear-gradient(-120deg, rgba(143, 201, 251, 0.301), 20%, #1976d2); 
                          color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Create Your First Course
                </a>
            </div>
        `;
    }

    showNotTeacherMessage() {
        this.contentContainer.innerHTML = `
            <div class="not-teacher" style="text-align: center; padding: 60px 20px;">
                <h3 style="color: #333; margin-bottom: 15px;">Teacher Access Required</h3>
                <p style="color: #666; margin-bottom: 25px;">You need to be a teacher to view and manage courses.</p>
                <a href="/pages/teacherrequest.html" 
                   style="display: inline-block; padding: 12px 24px; 
                          background: linear-gradient(-120deg, rgba(143, 201, 251, 0.301), 20%, #1976d2); 
                          color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Become a Teacher
                </a>
            </div>
        `;
    }
}


// =====================================================================
// 3. DELETION MANAGER - Handles all deletion operations
// =====================================================================

class DeletionManager {
    constructor() {
        this.deleteMode = {}; // Track delete mode per course
        console.log('DeletionManager initialized');
    }

    setupDeleteListeners() {
        console.log('Setting up delete listeners...');

        // 1. Course deletion (trash icon)
        document.querySelectorAll('.delete-course-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const courseElement = btn.closest('.course');
                const courseId = courseElement?.dataset.courseId;
                if (courseId) {
                    this.deleteCourse(courseId, courseElement);
                }
            });
        });

        // 2. Video deletion - WITH TOGGLE DELETE MODE
        document.querySelectorAll('.delete-videos-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const courseElement = btn.closest('.course');
                const courseId = courseElement?.dataset.courseId;
                if (courseId) {
                    this.handleDeleteVideos(courseId, courseElement, btn);
                }
            });
        });

        // 3. Assignment deletion
        document.querySelectorAll('.delete-assignment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const assignmentElement = btn.closest('.assignment');
                const assignmentId = assignmentElement?.dataset.assignmentId;
                if (assignmentId) {
                    this.deleteAssignment(assignmentId, assignmentElement);
                }
            });
        });

        // 4. Assignment file click to view
        document.querySelectorAll('.assignment-file').forEach(fileDiv => {
            fileDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileUrl = fileDiv.getAttribute('data-file-url');
                if (fileUrl && fileUrl !== '') {
                    window.open(fileUrl, '_blank');
                } else {
                    alert('No file available for this assignment');
                }
            });
        });

        // 5. Add video buttons
        document.querySelectorAll('.add-video-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const courseId = btn.dataset.courseId;
                const courseElement = btn.closest('.course');
                if (courseId && courseElement) {
                    this.handleAddVideo(courseId, courseElement);
                }
            });
        });

        // 6. Add assignment buttons
        document.querySelectorAll('.add-assignment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const courseId = btn.dataset.courseId;
                const courseElement = btn.closest('.course');
                if (courseId && courseElement) {
                    this.handleAddAssignment(courseId, courseElement);
                }
            });
        });

        console.log('Delete listeners setup complete');
    }

    // ========== VIDEO DELETION - TOGGLE BEHAVIOR ==========
    handleDeleteVideos(courseId, courseElement, deleteBtn) {
        const vdcards = courseElement.querySelector('.vdcards');
        const checkboxes = vdcards.querySelectorAll('.video-checkbox');

        if (!this.deleteMode[courseId]) {
            // ENTER delete mode - show checkboxes
            this.deleteMode[courseId] = true;

            checkboxes.forEach(cb => {
                cb.style.display = 'block';
            });

            deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-circle-x-icon lucide-circle-x">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6" /><path d="m9 9 6 6" />
                </svg>
                Remove Selected
            `;
        } else {
            // IN delete mode - check for selections
            const selectedIds = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => parseInt(cb.getAttribute('data-video-id')));

            if (selectedIds.length > 0) {
                this.deleteVideosFromServer(selectedIds, courseElement, courseId, deleteBtn);
            } else {
                this.exitDeleteMode(courseId, courseElement, deleteBtn);
            }
        }
    }

    async deleteVideosFromServer(videoIds, courseElement, courseId, deleteBtn) {
        if (!confirm(`Delete ${videoIds.length} selected video(s)?`)) {
            return;
        }

        try {
            const response = await fetch('/api/delete_videos.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_ids: videoIds })
            });

            const result = await response.json();

            if (result.success) {
                // Remove selected video elements
                videoIds.forEach(videoId => {
                    const videoCard = courseElement.querySelector(`[data-video-id="${videoId}"]`);
                    if (videoCard) {
                        videoCard.style.animation = 'slideOut 0.3s ease';
                        setTimeout(() => videoCard.remove(), 300);
                    }
                });

                // EXIT delete mode after deletion
                setTimeout(() => {
                    this.exitDeleteMode(courseId, courseElement, deleteBtn);

                    // If no videos remain, show placeholder
                    const vdcards = courseElement.querySelector('.vdcards');
                    const remainingVideos = vdcards.querySelectorAll('.video');
                    if (remainingVideos.length === 0) {
                        vdcards.innerHTML = '<p style="color: #999; font-style: italic;">No videos yet</p>';
                    }
                }, 350);
            } else {
                throw new Error(result.error || 'Failed to delete videos');
            }
        } catch (error) {
            console.error('Error deleting videos:', error);
            alert(`Error: ${error.message}`);
            this.exitDeleteMode(courseId, courseElement, deleteBtn);
        }
    }

    exitDeleteMode(courseId, courseElement, deleteBtn) {
        this.deleteMode[courseId] = false;
        const vdcards = courseElement.querySelector('.vdcards');
        const checkboxes = vdcards.querySelectorAll('.video-checkbox');

        checkboxes.forEach(cb => {
            cb.style.display = 'none';
            cb.checked = false;
        });

        deleteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-circle-x-icon lucide-circle-x">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" /><path d="m9 9 6 6" />
            </svg>
            delete
        `;
    }

    // ========== COURSE DELETION ==========
    async deleteCourse(courseId, courseElement) {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('/api/delete_course.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: parseInt(courseId) })
            });

            const result = await response.json();

            if (result.success) {
                courseElement.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    courseElement.remove();
                    this.checkEmptyPage();
                }, 300);
            } else {
                throw new Error(result.error || 'Failed to delete course');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // ========== ASSIGNMENT DELETION ==========
    async deleteAssignment(assignmentId, assignmentElement) {
        if (!confirm('Delete this assignment?')) {
            return;
        }

        try {
            const response = await fetch('/api/delete_assignment.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignment_id: parseInt(assignmentId) })
            });

            const result = await response.json();

            if (result.success) {
                assignmentElement.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    assignmentElement.remove();

                    // Check if placeholder needed
                    const assignmentsDiv = assignmentElement.closest('.assignments');
                    if (assignmentsDiv) {
                        const remainingAssignments = assignmentsDiv.querySelectorAll('.assignment');
                        if (remainingAssignments.length === 0) {
                            const placeholder = document.createElement('p');
                            placeholder.style.cssText = 'color: #999; font-style: italic;';
                            placeholder.textContent = 'No assignments yet';
                            const addButtonContainer = assignmentsDiv.querySelector('.add-assignment-container');
                            if (addButtonContainer) {
                                assignmentsDiv.insertBefore(placeholder, addButtonContainer);
                            }
                        }
                    }
                }, 300);
            } else {
                throw new Error(result.error || 'Failed to delete assignment');
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // ========== ADD VIDEO ==========
    handleAddVideo(courseId, courseElement) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/mp4,video/webm,video/mov';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('course_id', courseId);
            formData.append('video', file);

            try {
                const response = await fetch('/api/add_video.php', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const data = await response.json();

                if (data.success || data.video_id) {
                    const vdcards = courseElement.querySelector('.vdcards');
                    
                    // Remove placeholder if exists
                    const placeholder = Array.from(vdcards.querySelectorAll('p')).find(p => /no videos yet/i.test(p.textContent));
                    if (placeholder) placeholder.remove();

                    const newVideo = data.video || {
                        video_id: data.video_id,
                        video_title: file.name.replace(/\.[^/.]+$/, ''),
                        video_url: data.video_url || ''
                    };

                    // Create video element
                    const videoDiv = document.createElement('div');
                    videoDiv.className = 'video';
                    videoDiv.dataset.videoId = newVideo.video_id;
                    videoDiv.innerHTML = `
                        <div class="one">
                            <div class="vd-background">
                                <img src="../assets/images/webdev.jpg" alt="Video">
                            </div>
                            <div class="vd-info">
                                <div class="title">${newVideo.video_title}</div>
                                ${newVideo.video_url ? `<a href="${newVideo.video_url}" target="_blank" class="video-link" style="font-size: 12px; color: #1976d2;">View</a>` : ''}
                            </div>
                        </div>
                        <div class="two">
                            <input type="checkbox" class="video-checkbox" data-video-id="${newVideo.video_id}" style="display: none;">
                        </div>
                    `;

                    vdcards.appendChild(videoDiv);
                    alert('Video added successfully!');
                } else {
                    throw new Error(data.error || 'Failed to add video');
                }
            } catch (error) {
                console.error('Error adding video:', error);
                alert(`Error: ${error.message}`);
            }
        });

        input.click();
    }

    // ========== ADD ASSIGNMENT ==========
    handleAddAssignment(courseId, courseElement) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('course_id', courseId);
            formData.append('assignment', file);

            try {
                const response = await fetch('/api/add_assignment.php', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const data = await response.json();

                if (data.success || data.assignment_id) {
                    const assignmentsDiv = courseElement.querySelector('.assignments');
                    const addButtonContainer = assignmentsDiv.querySelector('.add-assignment-container');

                    // Remove placeholder if exists
                    const placeholder = Array.from(assignmentsDiv.querySelectorAll('p')).find(p => /no assignments yet/i.test(p.textContent));
                    if (placeholder) placeholder.remove();

                    const newAssignment = data.assignment || {
                        assignment_id: data.assignment_id,
                        assignment_title: file.name.replace(/\.[^/.]+$/, ''),
                        assignment_url: data.assignment_url || ''
                    };

                    // Create assignment element
                    const assignmentDiv = document.createElement('div');
                    assignmentDiv.className = 'assignment';
                    assignmentDiv.dataset.assignmentId = newAssignment.assignment_id;
                    assignmentDiv.innerHTML = `
                        <div class="pdf assignment-file" data-file-url="${newAssignment.assignment_url || ''}" style="cursor: pointer;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-file-icon lucide-file">
                                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                            </svg>
                            ${newAssignment.assignment_title}
                        </div>
                        <div class="edit-buttons">
                            <button class="deletebtn delete-assignment-btn" data-assignment-id="${newAssignment.assignment_id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="m15 9-6 6" />
                                    <path d="m9 9 6 6" />
                                </svg>
                                delete
                            </button>
                        </div>
                    `;

                    assignmentsDiv.insertBefore(assignmentDiv, addButtonContainer);

                    // Setup event listeners for new assignment
                    const fileDiv = assignmentDiv.querySelector('.assignment-file');
                    fileDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const fileUrl = fileDiv.getAttribute('data-file-url');
                        if (fileUrl && fileUrl !== '') {
                            window.open(fileUrl, '_blank');
                        } else {
                            alert('No file available for this assignment');
                        }
                    });

                    const deleteBtn = assignmentDiv.querySelector('.delete-assignment-btn');
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteAssignment(newAssignment.assignment_id, assignmentDiv);
                    });

                    alert('Assignment added successfully!');
                } else {
                    throw new Error(data.error || 'Failed to add assignment');
                }
            } catch (error) {
                console.error('Error adding assignment:', error);
                alert(`Error: ${error.message}`);
            }
        });

        input.click();
    }

    // ========== HELPER METHODS ==========
    checkEmptyPage() {
        const courses = document.querySelectorAll('.course');
        if (courses.length === 0) {
            const contentDiv = document.querySelector('.content');
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div class="no-courses" style="text-align: center; padding: 60px 20px;">
                        <h3 style="color: #333; margin-bottom: 15px;">No Courses Yet</h3>
                        <p style="color: #666; margin-bottom: 25px;">You haven't created any courses.</p>
                        <a href="/html/addcourse.html" 
                           style="display: inline-block; padding: 12px 24px; 
                                  background: linear-gradient(-120deg, rgba(143, 201, 251, 0.301), 20%, #1976d2); 
                                  color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                            Create Your First Course
                        </a>
                    </div>
                `;
            }
        }
    }
}


// =====================================================================
// 4. INITIALIZATION - Initialize everything when DOM loads
// =====================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing teach page...');

    // Initialize CourseManager first (renders courses)
    if (document.querySelector('.content')) {
        console.log('Initializing CourseManager...');
        window.courseManager = new CourseManager();
        await window.courseManager.init();
        
        // Then initialize DeletionManager (after courses are rendered)
        console.log('Initializing DeletionManager...');
        window.deletionManager = new DeletionManager();
        window.deletionManager.setupDeleteListeners();
    }

    // Initialize TeacherRequestManager (independent)
    if (document.querySelector('.requests')) {
        console.log('Initializing TeacherRequestManager...');
        window.teacherRequestManager = new TeacherRequestManager();
        await window.teacherRequestManager.init();
    }

    console.log('All managers initialized successfully');
});

// Also handle chat click events
document.addEventListener('DOMContentLoaded', () => {
    let chatLabels = document.getElementsByClassName('chat');
    for (let chatLabel of chatLabels) {
        chatLabel.addEventListener('click', () => {
            window.location.href = '/html/teacherProgress.html';
        });
    }
});