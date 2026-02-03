// /assets/js/load_enrolled_courses.js
class CourseLoader {
    constructor() {
        this.coursesContainer = document.querySelector('.courses');
        this.currentUser = null;
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadEnrolledCourses();
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/assets/php/getCurrentUser.php');
            const data = await response.json();
            if (data.success && data.user) {
                this.currentUser = data.user;
            }
        } catch (error) {
            console.error('Error loading user:', error);
        }
    }

    async loadEnrolledCourses() {
        try {
            const response = await fetch('/api/get_enrolled_courses.php');
            const data = await response.json();
            
            if (data.success && data.data && data.data.length > 0) {
                this.displayCourses(data.data);
            } else {
                this.showNoCoursesMessage();
            }
        } catch (error) {
            console.error('Error loading enrolled courses:', error);
            this.showErrorMessage();
        }
    }

    displayCourses(courses) {
        this.coursesContainer.innerHTML = '';
        
        courses.forEach(course => {
            const courseElement = this.createCourseElement(course);
            this.coursesContainer.appendChild(courseElement);
            
            // Load videos and assignments for this course
            this.loadCourseContent(course.course_id, courseElement);
        });
    }

    createCourseElement(course) {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'course';
        courseDiv.dataset.courseId = course.course_id;
        
        // Progress bar calculation
        const progressPercent = course.progress_percentage || 0;
        
        courseDiv.innerHTML = `
            <div class="coursename">
                <h3>${course.course_title}</h3>
                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">${progressPercent}% Complete</span>
                </div>
            </div>
            <div class="course-content" id="content-${course.course_id}">
                <!-- Videos and assignments will be loaded here -->
                <div class="loading">Loading content...</div>
            </div>
        `;
        
        return courseDiv;
    }

    async loadCourseContent(courseId, courseElement) {
        try {
            // Load videos
            const videosResponse = await fetch(`/api/get_videos.php?course_id=${courseId}`);
            const videosData = await videosResponse.json();
            
            // Load assignments
            const assignmentsResponse = await fetch(`/api/get_assignments.php?course_id=${courseId}`);
            const assignmentsData = await assignmentsResponse.json();
            
            // Display content
            this.displayCourseContent(courseId, videosData, assignmentsData, courseElement);
            
        } catch (error) {
            console.error(`Error loading content for course ${courseId}:`, error);
            this.showContentError(courseId, courseElement);
        }
    }

    displayCourseContent(courseId, videosData, assignmentsData, courseElement) {
        const contentContainer = courseElement.querySelector(`#content-${courseId}`);
        
        let videosHTML = '';
        if (videosData.success && videosData.data && videosData.data.length > 0) {
            videosHTML = `
                <div class="videos">
                    <div class="vdHead">
                        <p>Course videos</p>
                    </div>
                    <div class="vdcards">
                        ${videosData.data.map(video => this.createVideoCard(video)).join('')}
                    </div>
                </div>
            `;
        } else {
            videosHTML = '<div class="no-videos">No videos available yet</div>';
        }
        
        let assignmentsHTML = '';
        if (assignmentsData.success && assignmentsData.data && assignmentsData.data.length > 0) {
            assignmentsHTML = `
                <div class="assignments">
                    <p>Assignments</p>
                    ${assignmentsData.data.map(assignment => this.createAssignmentCard(assignment)).join('')}
                </div>
            `;
        } else {
            assignmentsHTML = '<div class="no-assignments">No assignments available yet</div>';
        }
        
        contentContainer.innerHTML = videosHTML + assignmentsHTML;
        
        // Attach video click events
        this.attachVideoClickListeners(courseId);
    }

    createVideoCard(video) {
        // Format duration from seconds to MM:SS or HH:MM:SS
        const formatDuration = (seconds) => {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            if (hrs > 0) {
                return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        
        return `
            <div class="video" data-video-id="${video.video_id}" data-video-url="${video.video_url}">
                <div class="vd-background">
                    <img src="${video.thumbnail_url || '../assets/images/video.png'}" alt="${video.title}">
                    <div class="play-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <polygon points="5,3 19,12 5,21"></polygon>
                        </svg>
                    </div>
                </div>
                <div class="vd-info">
                    <div class="title">${video.title}</div>
                    <div class="duration">${formatDuration(video.duration || 0)}</div>
                    <div class="watched-status ${video.is_watched ? 'watched' : 'not-watched'}">
                        ${video.is_watched ? '✓ Watched' : 'Not watched'}
                    </div>
                </div>
            </div>
        `;
    }

    createAssignmentCard(assignment) {
        return `
            <div class="assignment" data-assignment-id="${assignment.assignment_id}">
                <div class="pdf">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-file-icon lucide-file">
                        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                    </svg>
                    ${assignment.assignment_title}
                    <span class="assignment-status ${assignment.assignment_status}">
                        ${assignment.assignment_status || 'pending'}
                    </span>
                    <span class="max-score">Max: ${assignment.max_score || 100} pts</span>
                </div>
            </div>
        `;
    }

    attachVideoClickListeners(courseId) {
        const videoElements = document.querySelectorAll(`[data-course-id="${courseId}"] .video`);
        
        videoElements.forEach(videoEl => {
            videoEl.addEventListener('click', (e) => {
                e.preventDefault();
                const videoId = videoEl.dataset.videoId;
                const videoUrl = videoEl.dataset.videoUrl;
                const videoTitle = videoEl.querySelector('.title').textContent;
                
                this.openVideoPlayer(videoId, videoUrl, videoTitle, courseId);
            });
        });
    }

    openVideoPlayer(videoId, videoUrl, videoTitle, courseId) {
        // Open video player in new tab or modal
        const videoPlayerUrl = `/html/videoPlayer.html?video_id=${videoId}&course_id=${courseId}&video_url=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(videoTitle)}`;
        
        // Option 1: Open in new tab
        window.open(videoPlayerUrl, '_blank');
        
        // Option 2: Open in modal (if you have modal setup)
        // this.openVideoModal(videoId, videoUrl, videoTitle);
        
        // Update watched status
        this.markVideoAsWatched(videoId, courseId);
    }

    async markVideoAsWatched(videoId, courseId) {
        try {
            await fetch('/api/mark_video_watched.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_id: videoId,
                    course_id: courseId
                })
            });
            
            // Update UI locally
            const videoElement = document.querySelector(`[data-video-id="${videoId}"] .watched-status`);
            if (videoElement) {
                videoElement.textContent = '✓ Watched';
                videoElement.classList.add('watched');
                videoElement.classList.remove('not-watched');
            }
            
            // Update progress
            this.updateCourseProgress(courseId);
            
        } catch (error) {
            console.error('Error marking video as watched:', error);
        }
    }

    async updateCourseProgress(courseId) {
        try {
            const response = await fetch(`/api/get_course_progress.php?course_id=${courseId}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                const progress = data.data;
                const progressBar = document.querySelector(`[data-course-id="${courseId}"] .progress-fill`);
                const progressText = document.querySelector(`[data-course-id="${courseId}"] .progress-text`);
                
                if (progressBar && progressText) {
                    progressBar.style.width = `${progress.progress_percentage}%`;
                    progressText.textContent = `${progress.progress_percentage}% Complete`;
                }
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    showNoCoursesMessage() {
        this.coursesContainer.innerHTML = `
            <div class="no-courses">
                <h3>No Enrolled Courses</h3>
                <p>You haven't enrolled in any courses yet.</p>
                <a href="/pages/home.html" class="browse-courses-btn">Browse Courses</a>
            </div>
        `;
    }

    showErrorMessage() {
        this.coursesContainer.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Courses</h3>
                <p>There was a problem loading your courses. Please try again later.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }

    showContentError(courseId, courseElement) {
        const contentContainer = courseElement.querySelector(`#content-${courseId}`);
        contentContainer.innerHTML = `
            <div class="content-error">
                <p>Error loading course content. Please try again.</p>
                <button onclick="loadCourseContent(${courseId}, this.parentElement.parentElement)">Reload Content</button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const courseLoader = new CourseLoader();
    courseLoader.init();
});