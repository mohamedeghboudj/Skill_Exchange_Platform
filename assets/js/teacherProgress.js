// Configuration
const API_BASE_URL = 'http://localhost:8000/assets/php';
let currentTeacherId = null;
let currentCourseId = null;
let currentStudentId = null; // For when viewing specific student details

// DOM Elements
const leftArrow = document.getElementById("left-arrow");
const chatToggle = document.querySelector(".chat-toggle");
const sidebar = document.querySelector(".sidebar");
const closeChat = document.querySelector(".close-chat");




// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[TeacherProgress] Page loaded, initializing...');
  try {
    // Get teacher ID from session
    const userResponse = await fetch(`${API_BASE_URL}/getCurrentUser.php`);
    const userData = await userResponse.json();

    console.log('[TeacherProgress] getCurrentUser result:', userData.success ? 'OK' : 'FAIL', userData);

    if (!userData.success) {
      console.warn('[TeacherProgress] Not logged in');
      showError('Please log in to view progress');
      return;
    }

    // Verify user is a teacher
    const isTeacher = (userData.user.role === 'teacher' || userData.user.role === 'Teacher');
    if (!isTeacher) {
      console.warn('[TeacherProgress] Page is only for teachers. Current role:', userData.user.role);
      return;
    }
    console.log('[TeacherProgress] User is teacher, OK');

    currentTeacherId = userData.user.id;

    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentCourseId = urlParams.get('courseId');
    currentStudentId = urlParams.get('studentId');

    console.log('[TeacherProgress] URL params - courseId:', currentCourseId, 'studentId:', currentStudentId);

    // If missing from URL, try to recover from session (chat context)
    if (!currentCourseId) {
      console.log('[TeacherProgress] courseId missing from URL, trying session recovery...');
      const sessionData = await loadTeacherChatInfo();
      if (sessionData && sessionData.course_id) {
        currentCourseId = sessionData.course_id;
        currentStudentId = currentStudentId || sessionData.student_id;
        console.log('[TeacherProgress] Recovered from session - courseId:', currentCourseId, 'studentId:', currentStudentId);
      }
    }

    if (!currentCourseId) {
      console.warn('[TeacherProgress] courseId required but not found in URL or session');
      showError('Course ID is required. Please select a course.');
      return;
    }

    // Continue loading with identified IDs
    await initializeView();
    console.log('[TeacherProgress] Init complete');

  } catch (error) {
    console.error('[TeacherProgress] Initialization error:', error);
    showError('Failed to initialize page. Please try again.');
  }
});

/**
 * Common View Initialization
 */
async function initializeView() {
  // Load appropriate view
  if (currentStudentId) {
    console.log('[TeacherProgress] Loading student details...');
    await loadStudentDetails();
  } else {
    console.log('[TeacherProgress] Loading students progress list...');
    await loadStudentsProgress();
  }

  // Load Sidebar (Enrolled Students)
  await loadSidebarStudents();
}

/**
 * Load Sidebar with Enrolled Students
 */
async function loadSidebarStudents() {
  const listContainer = document.querySelector('.list-friend');
  if (!listContainer) {
    console.warn('[TeacherProgress] loadSidebarStudents: no .list-friend container');
    return;
  }

  try {
    console.log('[TeacherProgress] Fetching get_enrolled_students...');
    const response = await fetch(`${API_BASE_URL}/teacher_progress.php?action=get_enrolled_students`);
    const result = await response.json();

    console.log('[TeacherProgress] get_enrolled_students:', result.success ? 'OK' : 'FAIL', result.students?.length ?? 0, 'students');

    if (result.success && result.students?.length > 0) {
      listContainer.innerHTML = '';

      result.students.forEach(student => {
        const li = document.createElement('li');
        li.className = 'friend-item';
        if (student.student_id == currentStudentId) {
          li.classList.add('active');
        }

        const dateStr = student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : '—';

        li.innerHTML = `
                    <img src="${student.profile_picture || '/assets/images/default-profile.png'}" alt="Profile" onerror="this.src='https://via.placeholder.com/40'">
                    <div class="message-content">
                        <div class="name-header">
                            <span class="friend-name">${student.student_name}</span>
                            <span class="time">${dateStr}</span>
                        </div>
                        <p class="last-message">${student.course_title}</p>
                    </div>
                `;

        li.addEventListener('click', () => {
          window.location.href = `/html/teacherProgress.html?courseId=${student.course_id}&studentId=${student.student_id}`;
        });

        listContainer.appendChild(li);
      });
      console.log('[TeacherProgress] Sidebar students loaded');
    } else {
      console.log('[TeacherProgress] No enrolled students or API failed');
      listContainer.innerHTML = '<li class="empty">No students enrolled</li>';
    }
  } catch (error) {
    console.error('[TeacherProgress] Error loading sidebar students:', error);
  }
}

// Navigate back
if (leftArrow) {
  leftArrow.addEventListener('click', () => {
    window.location.href = "/html/teach.html";
  });
}

// Chat toggle
if (chatToggle && sidebar && closeChat) {
  chatToggle.onclick = () => {
    sidebar.classList.add("active");
  };

  closeChat.onclick = () => {
    sidebar.classList.remove("active");
  };
}

/**
 * Load all students' progress for the course
 */
async function loadStudentsProgress() {
  try {
    console.log('[TeacherProgress] Fetching students-progress...', { courseId: currentCourseId });
    const response = await fetch(`${API_BASE_URL}/teacher_progress.php?action=students-progress&course_id=${currentCourseId}`);
    const result = await response.json();

    console.log('[TeacherProgress] students-progress API response:', result.success ? 'OK' : 'FAIL', result);

    if (!result.success) {
      console.warn('[TeacherProgress] students-progress failed:', result.message);
      showError(result.message || 'Failed to load students progress');
      return;
    }

    // Update header with course name
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) headerTitle.textContent = result.course_title;

    // Update sidebar course info
    const courseTitle = document.querySelector('.course-title');
    if (courseTitle) courseTitle.textContent = result.course_title;

    const courseSub = document.querySelector('.course-sub');
    if (courseSub) courseSub.textContent = `${result.total_students || 0} students enrolled`;

    // Display students list in main (replace hardcoded content)
    displayStudentsList(result.students || [], result.course_title);
    console.log('[TeacherProgress] loadStudentsProgress complete');

  } catch (error) {
    console.error('[TeacherProgress] Error loading students progress:', error);
    showError('Failed to load students progress');
  }
}

/**
 * Display list of all students with their progress (when no student selected)
 */
function displayStudentsList(students, courseTitle) {
  const main = document.querySelector('main');
  if (!main) return;

  // Replace main with "select a student" view - no hardcoded stats
  main.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-left-icon lucide-move-left" id="left-arrow">
      <path d="M6 8L2 12L6 16"/><path d="M2 12H22"/>
    </svg>
    <div class="progress-box" style="padding: 40px;">
      <h3>Select a student</h3>
      <p>Choose a student from the sidebar to view their course progress, videos watched, and assignment grades.</p>
      ${students.length > 0 ? `<p><strong>${students.length} students</strong> enrolled in this course.</p>` : ''}
    </div>
  `;

  const newLeftArrow = document.getElementById("left-arrow");
  if (newLeftArrow) {
    newLeftArrow.addEventListener('click', () => {
      window.location.href = "/html/teach.html";
    });
  }
}

/**
 * Load detailed progress for a specific student
 */
async function loadStudentDetails() {
  try {
    console.log('[TeacherProgress] Fetching student-assignments...', { courseId: currentCourseId, studentId: currentStudentId });
    const response = await fetch(`${API_BASE_URL}/teacher_progress.php?action=student-assignments&course_id=${currentCourseId}&student_id=${currentStudentId}`);
    const result = await response.json();

    console.log('[TeacherProgress] student-assignments API response:', result);

    if (!result.success) {
      console.warn('[TeacherProgress] student-assignments failed:', result.message);
      showError(result.message || 'Failed to load student details');
      return;
    }
    console.log('[TeacherProgress] student-assignments OK, stats:', result.stats, 'videos:', result.videos?.length, 'assignments:', result.assignments?.length);

    // Update header
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) headerTitle.textContent = result.course_title;

    const userElement = document.querySelector('.user');
    if (userElement) userElement.textContent = result.student?.student_name || 'Student';

    // Update sidebar
    const courseTitle = document.querySelector('.course-title');
    if (courseTitle) courseTitle.textContent = result.course_title;

    const courseSub = document.querySelector('.course-sub');
    if (courseSub) courseSub.textContent = `Student: ${result.student?.student_name || ''}`;

    // Display student progress
    displayStudentProgress(result);
    console.log('[TeacherProgress] loadStudentDetails complete');

  } catch (error) {
    console.error('[TeacherProgress] Error loading student details:', error);
    showError('Failed to load student details');
  }
}

/**
 * Display detailed progress for a specific student
 */
function displayStudentProgress(data) {
  const main = document.querySelector('main');
  if (!main) {
    console.warn('[TeacherProgress] displayStudentProgress: no main element');
    return;
  }

  const stats = data.stats || {};
  const student = data.student || {};
  const watchedVideos = stats.watched_videos ?? 0;
  const totalVideos = stats.total_videos ?? 0;
  const doneCount = stats.done_count ?? stats.graded_assignments ?? 0;
  const missedCount = stats.missed_count ?? 0;
  const averageMark = stats.average_mark ?? 0;

  console.log('[TeacherProgress] displayStudentProgress - stats:', { watchedVideos, totalVideos, doneCount, missedCount, averageMark });

  main.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-left-icon lucide-move-left" id="left-arrow">
      <path d="M6 8L2 12L6 16"/><path d="M2 12H22"/>
    </svg>
    
    <!-- Overall Progress -->
    <div class="progress-box">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-icon lucide-message-circle chat-toggle">
        <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>
      </svg>
      <div class="progress-header">
        <span>Course progress - ${student.student_name || 'Student'}</span>
        <span>${Math.round(student.progress_percentage || 0)}% complete</span>
      </div>
      <div class="progress-bar">
        <div style="width: ${student.progress_percentage || 0}%"></div>
      </div>
      <p class="stats">
        Videos watched: <b>${watchedVideos} / ${totalVideos}</b> &nbsp; | &nbsp;
        Assignments: <b>${doneCount} done · ${missedCount} missed</b> &nbsp; | &nbsp;
        Average mark: <b>${averageMark}%</b>
      </p>
    </div>
    
    <!-- Video Progress -->
    <div class="progress-box">
      <h3>Video progress</h3>
      <div class="stepper" id="video-stepper"></div>
    </div>
    
    <!-- Assignments -->
    <div class="progress-box">
      <h3>Assignments and marks</h3>
      <div id="assignments-list"></div>
      
      <!-- Grading Panel -->
      <div class="progress-box" id="grading-panel" style="display:none; margin-top: 20px; background: #f9f9f9;">
        <h3 id="assignment-title">Assignment</h3>

        <div class="submission-box">
            <p><strong>Student submission:</strong></p>
            <div class="submission-pdf" style="cursor: pointer;">
                <div class="pdf-thumbnail">
                    <img src="/assets/images/pdf.jpg" alt="PDF Icon" onerror="this.src='https://via.placeholder.com/50'">
                </div>
                <div class="pdf-info">
                    <h3>Submission</h3>
                    <p>Click to view</p> // Filename dynamically loaded
                </div>
            </div>
        </div>

        <div class="grading-box" style="margin-top: 15px;">
            <label>Score:</label>
            <input type="number" id="score-input" min="0" max="100" style="padding: 5px; width: 60px;">
            <button id="save-grade" style="padding: 5px 15px; cursor: pointer; background: #28a745; color: white; border: none; border-radius: 4px;">Save grade</button>
        </div>
      </div>
    </div>
  `;

  // Re-attach left arrow listener
  const newLeftArrow = document.getElementById("left-arrow");
  if (newLeftArrow) {
    newLeftArrow.addEventListener('click', () => {
      // Go back to students list
      window.location.href = `/html/teacherProgress.html?courseId=${currentCourseId}`;
    });
  }

  // Display videos
  const videoStepper = document.getElementById('video-stepper');
  if (videoStepper && data.videos.length > 0) {
    data.videos.forEach(video => {
      const stepDiv = document.createElement('div');
      stepDiv.className = `step ${video.watched ? 'completed' : ''}`;
      stepDiv.innerHTML = `
        <span class="circle"></span>
        <p>${video.video_title}</p>
      `;
      videoStepper.appendChild(stepDiv);
    });
  } else if (videoStepper) {
    videoStepper.innerHTML = '<p style="padding: 20px; color: #666;">No videos in this course</p>';
  }

  // Display assignments
  const assignmentsList = document.getElementById('assignments-list');
  if (assignmentsList && data.assignments.length > 0) {
    data.assignments.forEach(assignment => {
      const rowDiv = document.createElement('div');

      let statusClass = '';
      let scoreDisplay = '';

      if (assignment.status === 'graded') { // PHP 'graded' means scored
        statusClass = 'done';
        scoreDisplay = `${assignment.score} / ${assignment.max_score}`;
      } else if (assignment.status === 'submitted') { // PHP 'submitted' means needs grading
        statusClass = 'pending';
        scoreDisplay = 'Needs Grading';
      } else if (assignment.status === 'not_submitted') {
        // Check if due_date passed? 
        statusClass = 'missed'; // Default to missed or locked?
        scoreDisplay = 'Not Submitted';
      } else {
        statusClass = 'locked';
        scoreDisplay = 'Locked';
      }

      rowDiv.className = `row ${statusClass} assignment`;
      rowDiv.dataset.id = assignment.assignment_id;
      rowDiv.dataset.submissionId = assignment.submission_id || '';

      rowDiv.innerHTML = `
        <span>${assignment.assignment_title}</span>
        <span>${scoreDisplay}</span>
      `;

      assignmentsList.appendChild(rowDiv);
    });
  } else if (assignmentsList) {
    assignmentsList.innerHTML = '<p style="padding: 20px; color: #666;">No assignments in this course</p>';
  }

  // Attach Handlers
  attachGradingHandlers();
}

/**
 * Attach Handlers for Grading
 */
function attachGradingHandlers() {
  const assignments = document.querySelectorAll(".assignment");
  const gradingPanel = document.getElementById("grading-panel");
  const saveButton = document.getElementById("save-grade");
  const scoreInput = document.getElementById("score-input");

  // Cleanup previous listeners if any (simple way: clone node? or just be careful)
  // Since we destroy DOM on load, listeners are gone. 

  assignments.forEach(assignment => {
    const submissionId = assignment.dataset.submissionId;
    const assignmentTitle = assignment.querySelector("span").textContent;
    // Only allow grading if there is a submission (pending or graded)
    if (submissionId && (assignment.classList.contains('pending') || assignment.classList.contains('done'))) {
      assignment.style.cursor = 'pointer';
      assignment.addEventListener('click', async () => {
        // Fetch full submission details including URL
        document.getElementById("assignment-title").textContent = assignmentTitle;
        gradingPanel.dataset.submissionId = submissionId;
        gradingPanel.style.display = "block";

        // Load details
        try {
          const response = await fetch(`${API_BASE_URL}/teacher_progress.php?action=submission&submission_id=${submissionId}`);
          const res = await response.json();
          if (res.success) {
            // Update URL and thumbnail
            const pdfDiv = document.querySelector(".submission-pdf");
            pdfDiv.onclick = () => window.open(res.submission_url, '_blank');

            // Update score input
            scoreInput.value = res.score !== null ? res.score : '';
            scoreInput.max = res.max_score;
          }
        } catch (e) { console.error(e); }
      });
    }
  });

  // Save Grade Handler
  // Note: saveButton is created new each time displayStudentProgress runs, so no duplicate listener issue
  if (saveButton) {
    saveButton.onclick = async () => {
      const submissionId = gradingPanel.dataset.submissionId;
      const score = scoreInput.value;

      if (!submissionId || score === '') {
        alert("Please enter a valid score");
        return;
      }

      try {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        const response = await fetch(`${API_BASE_URL}/teacher_progress.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }, // teacher_progress.php reads php://input json
          body: JSON.stringify({
            action: 'grade-assignment',
            submission_id: submissionId,
            score: score
          })
        });

        const res = await response.json();
        if (res.success) {
          alert("Grade saved!");
          gradingPanel.style.display = "none";
          // Reload
          loadStudentDetails();
        } else {
          alert(res.message || "Error saving grade");
        }
      } catch (error) {
        console.error(error);
        alert("Error saving grade");
      } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save grade";
      }
    };
  }
}




// Helper: Show Error (console only, no alert)
function showError(message) {
  console.error('[TeacherProgress] Error:', message);
}

// Event for unlock spans in locked assignments
document.addEventListener("DOMContentLoaded", () => {
  console.log("JS is running");
  // attachAssignmentClickHandlers(); // REMOVED: Function was not defined

  const assignmentsContainer = document.querySelector('.progress-box:last-of-type'); // Assignments section
  if (assignmentsContainer) {
    assignmentsContainer.addEventListener('click', (e) => {
      // Check if clicked element text is "unlock" and inside locked row
      if (e.target.textContent.trim() === 'unlock' && e.target.closest('.row.locked')) {
        const row = e.target.closest('.row');
        const statusSpan = row.querySelector('span:last-child'); // Status span

        // Swap classes and update status text
        row.classList.remove('locked');
        row.classList.add('pending');
        statusSpan.textContent = 'Pending';

        // Remove the unlock span completely
        e.target.remove();

        console.log('Unlocked assignment to pending');
      }
    });
  }
});


leftArrow.addEventListener('click', () => {
  window.location.href = "/html/teach.html";
});

// ========== UPDATED CODE FOR DYNAMIC CHAT INFO (Session-Based) ==========

// Load chat information from session (returns data for recovery)
async function loadTeacherChatInfo() {
  try {
    const response = await fetch(
      `../api/get_chat_info.php?action=get_teacher_chat_info`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    const result = await response.json();

    if (result.success) {
      const data = result.data;

      // Update UI elements
      const headerTitle = document.querySelector('header h1');
      if (headerTitle) headerTitle.textContent = data.course_title;

      const chatCourseTitle = document.querySelector('#chat-header .course-title');
      if (chatCourseTitle) chatCourseTitle.textContent = data.course_title;

      const chatCourseSub = document.querySelector('#chat-header .course-sub');
      if (chatCourseSub) chatCourseSub.textContent = `student ${data.student_name}`;

      const userDiv = document.querySelector('.user');
      if (userDiv) userDiv.textContent = data.student_name;

      console.log('[TeacherProgress] Teacher chat info loaded successfully');
      return data;
    } else {
      console.warn('[TeacherProgress] Chat info: no active chat', result.message);
      return null;
    }
  } catch (error) {
    console.warn('[TeacherProgress] Error fetching teacher chat info:', error);
    return null;
  }
}

