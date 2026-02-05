// File: /assets/js/teach.js - FINAL VERSION WITH DATABASE DELETION

// =====================================================================
// TEACHER REQUEST MANAGER - HANDLES STUDENT REQUESTS
// =====================================================================

class TeacherRequestManager {
    constructor() {
        this.requestsContainer = document.querySelector('.requests');
        this.popup = document.getElementById('popup');
        this.currentUser = null;
        
        console.log('TeacherRequestManager initialized');
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadTeacherRequests();
    }

 // In backendteach.js - update loadCurrentUser method
async loadCurrentUser() {
    try {
        console.log('Loading current user from new API...');
        
        // ✅ Use your new API endpoint
        const response = await fetch('/api/get_current_user.php');
        
        if (!response.ok) {
            console.error('HTTP error:', response.status);
            return false;
        }
        
        const data = await response.json();
        console.log('New user API response:', data);
        
        if (data.success && data.user) {
            this.currentUser = data.user;
            
            // ✅ is_teacher is now guaranteed to be correct
            console.log('is_teacher from session:', this.currentUser.is_teacher);
            console.log('Type:', typeof this.currentUser.is_teacher);
            
            this.isTeacher = this.currentUser.is_teacher === 1;
            
            console.log('User is teacher?', this.isTeacher);
            
            if (!this.isTeacher) {
                console.warn('User is NOT a teacher');
                this.showNotTeacherMessage();
                return false;
            }
            
            console.log('✅ User authenticated as teacher');
            return true;
            
        } else {
            console.warn('API error:', data.error);
            return false;
        }
    } catch (error) {
        console.error('Error loading user:', error);
        return false;
    }
}
   // In teach.js - TeacherRequestManager class
async loadTeacherRequests() {
    try {
        console.log('Loading teacher requests from API...');
        
        // Make sure this matches your file name
        const response = await fetch('/api/get_teacher_pending_requests.php');
        
        if (!response.ok) {
            console.log('Request API returned status:', response.status);
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`Loaded ${data.data?.length || 0} requests`);
            if (data.data && data.data.length > 0) {
                this.displayRequests(data.data);
            } else {
                this.showNoRequestsMessage();
            }
        } else {
            console.log('API returned success=false:', data.error);
            this.showNoRequestsMessage();
        }
    } catch (error) {
        console.log('Could not load requests:', error.message);
        this.showNoRequestsMessage();
    }
}
    displayRequests(requests) {
        if (!this.requestsContainer) {
            console.error('Requests container (.requests) not found in HTML');
            return;
        }
        
        // Clear existing content but keep the title
        this.requestsContainer.innerHTML = '<p>Requests to join courses</p>';
        
        if (!requests || requests.length === 0) {
            this.showNoRequestsMessage();
            return;
        }
        
        // Group requests by course
        const requestsByCourse = this.groupRequestsByCourse(requests);
        
        // Display grouped requests
        Object.keys(requestsByCourse).forEach(courseTitle => {
            const courseRequests = requestsByCourse[courseTitle];
            
            const courseSection = document.createElement('div');
            courseSection.className = 'course-requests';
            courseSection.innerHTML = `<p>${courseTitle} requests</p>`;
            
            courseRequests.forEach(request => {
                const requestElement = this.createRequestElement(request);
                courseSection.appendChild(requestElement);
            });
            
            this.requestsContainer.appendChild(courseSection);
        });
        
        // Attach click listeners
        this.attachRequestClickListeners();
    }

    groupRequestsByCourse(requests) {
        const grouped = {};
        
        requests.forEach(request => {
            const courseTitle = request.course_title || 'Unknown Course';
            
            if (!grouped[courseTitle]) {
                grouped[courseTitle] = [];
            }
            
            grouped[courseTitle].push(request);
        });
        
        return grouped;
    }

    createRequestElement(request) {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request';
        requestDiv.dataset.requestId = request.request_id;
        requestDiv.dataset.status = request.request_status;
        
        // Store full request data
        requestDiv.dataset.requestData = JSON.stringify(request);
        
        // Status styling
        const status = request.request_status || 'pending';
        const statusClass = this.formatStatus(status).toLowerCase();
        
        // Format time
        const timeAgo = this.getTimeAgo(request.request_date);
        
        requestDiv.innerHTML = `
            <div class="chatImg">
                <img src="${request.student_picture || '../assets/images/pf4.jpg'}" 
                     alt="${request.student_name || 'Student'}"
                     onerror="this.src='../assets/images/pf4.jpg'">
            </div>
            <div class="chatInfo">
                <div class="name">${request.student_name || 'Unknown Student'}</div>
                <div class="Rcourse ${statusClass}">${this.formatStatus(status)}</div>
                <div class="time-ago">${timeAgo}</div>
            </div>
        `;
        
        // Add status indicator
        requestDiv.style.borderLeft = `4px solid ${this.getStatusColor(status)}`;
        requestDiv.style.cursor = 'pointer';
        requestDiv.style.transition = 'background-color 0.2s';
        
        // Add hover effect
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
            requestEl.addEventListener('click', () => {
                const requestData = JSON.parse(requestEl.dataset.requestData);
                this.openRequestReview(requestData);
            });
        });
    }

    openRequestReview(request) {
        console.log('Opening request review:', request);
        
        if (!this.popup) {
            console.error('Popup dialog (#popup) not found in HTML');
            window.open(`/requestReview.html?request=${encodeURIComponent(JSON.stringify(request))}`, '_blank');
            return;
        }
        
        // Set iframe source with request data
        const iframe = this.popup.querySelector('iframe');
        if (iframe) {
            iframe.src = `/requestReview.html?request=${encodeURIComponent(JSON.stringify(request))}`;
            this.popup.showModal();
        } else {
            console.error('Iframe not found in popup');
        }
    }

    getTimeAgo(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffMins < 60) {
                return `${diffMins}m ago`;
            } else if (diffHours < 24) {
                return `${diffHours}h ago`;
            } else if (diffDays < 7) {
                return `${diffDays}d ago`;
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        } catch (e) {
            return '';
        }
    }

    getStatusColor(status) {
        switch (status) {
            case 'pending': return '#ffc107'; // yellow
            case 'accepted': return '#28a745'; // green
            case 'declined': return '#dc3545'; // red
            default: return '#6c757d'; // gray
        }
    }

    formatStatus(status) {
        if (!status) return 'Pending';
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    showNotTeacherMessage() {
        if (this.requestsContainer) {
            this.requestsContainer.innerHTML = `
                <div class="not-teacher">
                    <p>Teacher access required</p>
                    <p class="subtext">You need to be a teacher to view student requests.</p>
                    <a href="/pages/teacherrequest.html" class="become-teacher-btn">Become a Teacher</a>
                </div>
            `;
        }
    }

    showNoRequestsMessage() {
        if (this.requestsContainer) {
            this.requestsContainer.innerHTML += `
                <div class="no-requests">
                    <p>No student requests at the moment</p>
                    <p class="subtext">When students apply to your courses, requests will appear here.</p>
                </div>
            `;
        }
    }

    showErrorMessage(message = 'Error loading requests') {
        if (this.requestsContainer) {
            this.requestsContainer.innerHTML += `
                <div class="error-message">
                    <p>${message}</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
            `;
        }
    }
}

// =====================================================================
// DELETION MANAGER - MATCHES LOCALSTORAGE UI WITH DATABASE FUNCTIONALITY
// =====================================================================

class DeletionManager {
    constructor() {
        this.deleteMode = {}; // Track delete mode per course (matches localStorage behavior)
        console.log('DeletionManager initialized');
        this.setupDeleteListeners();
    }

    setupDeleteListeners() {
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

        // 2. Video deletion - WITH TOGGLE DELETE MODE (matches localStorage)
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
    }

    // ========== VIDEO DELETION - MATCHES LOCALSTORAGE TOGGLE BEHAVIOR ==========
    handleDeleteVideos(courseId, courseElement, deleteBtn) {
        const vdcards = courseElement.querySelector('.vdcards');
        const checkboxes = vdcards.querySelectorAll('.video-checkbox');

        // Toggle delete mode (same as localStorage version)
        if (!this.deleteMode[courseId]) {
            // ENTER delete mode - show checkboxes
            this.deleteMode[courseId] = true;

            checkboxes.forEach(cb => {
                cb.style.display = 'block';
            });

            // Change button text (same as localStorage)
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
                // DELETE selected videos via DATABASE API
                this.deleteVideosFromServer(selectedIds, courseElement, courseId, deleteBtn);
            } else {
                // EXIT delete mode without deleting
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_ids: videoIds })
            });

            const result = await response.json();

            if (result.success) {
                // Remove selected video elements with animation
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
                    
                    // If no videos remain, show placeholder (same as localStorage)
                    const vdcards = courseElement.querySelector('.vdcards');
                    const remainingVideos = vdcards.querySelectorAll('.video');
                    if (remainingVideos.length === 0) {
                        const placeholder = document.createElement('p');
                        placeholder.style.color = '#999';
                        placeholder.style.fontStyle = 'italic';
                        placeholder.textContent = 'No videos yet';
                        vdcards.appendChild(placeholder);
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
        
        checkboxes.forEach(cb => cb.style.display = 'none');
        
        // Reset button text (same as localStorage)
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: parseInt(courseId) })
            });

            const result = await response.json();

            if (result.success) {
                // Remove course element with animation
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignment_id: parseInt(assignmentId) })
            });

            const result = await response.json();

            if (result.success) {
                // Remove assignment element with animation
                assignmentElement.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    assignmentElement.remove();
                    
                    // If no assignments remain, add placeholder
                    const assignmentsDiv = assignmentElement.closest('.assignments');
                    if (assignmentsDiv) {
                        const remainingAssignments = assignmentsDiv.querySelectorAll('.assignment');
                        if (remainingAssignments.length === 0) {
                            const placeholder = document.createElement('p');
                            placeholder.style.color = '#999';
                            placeholder.style.fontStyle = 'italic';
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

    // ========== HELPER METHODS ==========
    checkEmptyPage() {
        const courses = document.querySelectorAll('.course');
        if (courses.length === 0) {
            const contentDiv = document.querySelector('.content');
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div class="no-courses">
                        <h3>No Courses Yet</h3>
                        <p>You haven't created any courses.</p>
                        <a href="/html/addcourse.html" class="create-course-btn">Create Your First Course</a>
                    </div>
                `;
            }
        }
    }
}

// =====================================================================
// INITIALIZATION - ADD THIS AT THE VERY END OF THE FILE
// =====================================================================

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing teach page managers...');
    
    // Initialize TeacherRequestManager if on teach page with requests section
    if (document.querySelector('.requests')) {
        const teacherRequestManager = new TeacherRequestManager();
        teacherRequestManager.init();
    }
    
    // Initialize DeletionManager if on teach page with courses
    if (document.querySelector('.course')) {
        new DeletionManager();
    }
});

// Also initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (document.querySelector('.requests') && !window.teacherRequestManager) {
            console.log('DOM already ready, initializing TeacherRequestManager...');
            window.teacherRequestManager = new TeacherRequestManager();
            window.teacherRequestManager.init();
        }
        if (document.querySelector('.course') && !window.deletionManager) {
            console.log('DOM already ready, initializing DeletionManager...');
            window.deletionManager = new DeletionManager();
        }
    }, 100);
}
// File: /assets/js/backendteach.js - SIMPLIFIED VERSION
// =====================================================================

class CourseManager {
    constructor() {
        this.contentContainer = document.querySelector('.content');
        this.currentUser = null;
        this.courses = [];
        
        console.log('CourseManager initialized');
    }

    async init() {
        await this.loadCurrentUser();
        if (!this.currentUser?.is_teacher) {
            this.showNotTeacherMessage();
            return;
        }
        
        await this.loadTeacherCourses();
        this.renderCourses();
        this.setupEventListeners();
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/assets/php/getCurrentUser.php');
            const data = await response.json();
            if (data.success && data.user) {
                this.currentUser = data.user;
                console.log('Teacher loaded:', this.currentUser.full_name);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error loading user:', error);
            return false;
        }
    }

    async loadTeacherCourses() {
        try {
            const response = await fetch('/api/get_courses.php');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.courses = await response.json();
            console.log(`Loaded ${this.courses.length} courses`);
        } catch (error) {
            console.error('Error loading courses:', error);
            this.courses = [];
        }
    }

    async renderCourses() {
        if (!this.contentContainer) return;
        
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
            
            this.createCourseElement(course, videos, assignments);
        }
    }

    async loadCourseVideos(courseId) {
        try {
            const response = await fetch(`/api/get_videos.php?course_id=${courseId}`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error(`Error loading videos for course ${courseId}:`, error);
            return [];
        }
    }

    async loadCourseAssignments(courseId) {
        try {
            const response = await fetch(`/api/get_assignments.php?course_id=${courseId}`);
            if (!response.ok) return [];
            return await response.json();
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
            
            <div class="course-info">
                <div class="info-row">
                    <span class="label">Category:</span>
                    <span class="value">${course.category || 'Not set'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Description:</span>
                    <span class="value">${course.course_description || 'No description'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Duration:</span>
                    <span class="value">${durationText}</span>
                </div>
                <div class="info-row">
                    <span class="label">Price:</span>
                    <span class="value">${priceText}</span>
                </div>
                <div class="info-row">
                    <span class="label">Enrolled:</span>
                    <span class="value">${course.enrolled_count || 0} students</span>
                </div>
                <div class="info-row">
                    <span class="label">Rating:</span>
                    <span class="value">${course.rating ? `${course.rating}/5.0` : 'Not rated'}</span>
                </div>
            </div>

            <div class="videos">
                <div class="vdHead">
                    <p>Course Videos (${videos.length})</p>
                    <div class="edit-buttons">
                        <button class="delete-videos-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m15 9-6 6" />
                                <path d="m9 9 6 6" />
                            </svg>
                            Delete
                        </button>
                        <button class="addVd add-video-btn" data-course-id="${course.course_id}">
                            + Add Video
                        </button>
                    </div>
                </div>
                <div class="vdcards">
                    ${videos.length > 0 ? 
                        videos.map(v => `
                            <div class="video" data-video-id="${v.video_id}">
                                <div class="one">
                                    <div class="vd-background">
                                        <img src="../assets/images/video-thumbnail.jpg" alt="Video">
                                    </div>
                                    <div class="vd-info">
                                        <div class="title">${v.video_title}</div>
                                        <a href="${v.video_url}" target="_blank" class="video-link">View</a>
                                    </div>
                                </div>
                                <div class="two">
                                    <input type="checkbox" class="video-checkbox" data-video-id="${v.video_id}">
                                </div>
                            </div>
                        `).join('') : 
                        '<p class="no-content">No videos yet</p>'
                    }
                </div>
            </div>

            <div class="assignments">
                <p>Assignments (${assignments.length})</p>
                <div class="assignments-list">
                    ${assignments.length > 0 ? 
                        assignments.map(a => `
                            <div class="assignment" data-assignment-id="${a.assignment_id}">
                                <div class="pdf">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="lucide lucide-file-icon lucide-file">
                                        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                    </svg>
                                    ${a.assignment_title}
                                    <span class="status ${a.assignment_status}">${a.assignment_status}</span>
                                </div>
                                <div class="edit-buttons">
                                    <button class="delete-assignment-btn" data-assignment-id="${a.assignment_id}">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        `).join('') : 
                        '<p class="no-content">No assignments yet</p>'
                    }
                </div>
                <div class="add-assignment-container">
                    <button class="addAss add-assignment-btn" data-course-id="${course.course_id}">
                        + Add Assignment
                    </button>
                </div>
            </div>
        `;

        this.contentContainer.appendChild(courseDiv);
    }

    setupEventListeners() {
        // Copy event listeners from your existing teach.js
        // or integrate with your existing DeletionManager
    }

    showNoCoursesMessage() {
        this.contentContainer.innerHTML = `
            <div class="no-courses">
                <h3>No Courses Yet</h3>
                <p>You haven't created any courses.</p>
                <a href="/html/addcourse.html" class="create-course-btn">Create Your First Course</a>
            </div>
        `;
    }

    showNotTeacherMessage() {
        this.contentContainer.innerHTML = `
            <div class="not-teacher">
                <h3>Teacher Access Required</h3>
                <p>You need to be a teacher to view and manage courses.</p>
                <a href="/pages/teacherrequest.html" class="become-teacher-btn">Become a Teacher</a>
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new CourseManager().init();
});