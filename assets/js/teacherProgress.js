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
  try {
    // Get teacher ID from session
    const userResponse = await fetch(`${API_BASE_URL}/getCurrentUser.php`);
    const userData = await userResponse.json();

    if (!userData.success) {
      showError('Please log in to view progress');
      return;
    }


    // Verify user is a teacher
    if (userData.user.role !== 'teacher') {
      showError('Only teachers can access this page');
      return;
    }

    currentTeacherId = userData.user.id;

    // Get course ID and optional student ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentCourseId = urlParams.get('courseId');
    currentStudentId = urlParams.get('studentId');

    if (!currentCourseId) {
      showError('Course ID is required. Please select a course.');
      return;
    }

    // Load appropriate view
    if (currentStudentId) {
      // Show specific student's progress
      await loadStudentDetails();
    } else {
      // Show all students in the course
      await loadStudentsProgress();
    }

    // Load Sidebar (Enrolled Students)
    await loadSidebarStudents();

  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize page. Please try again.');
  }
});

/**
 * Load Sidebar with Enrolled Students
 */
async function loadSidebarStudents() {
  const listContainer = document.querySelector('.list-friend');
  if (!listContainer) return;

  try {
    const response = await fetch(`${API_BASE_URL}/teacher_progress.php?action=get_enrolled_students`);
    const result = await response.json();

    if (result.success && result.students.length > 0) {
      listContainer.innerHTML = ''; // Clear hardcoded items

      result.students.forEach(student => {
        const li = document.createElement('li');
        li.className = 'friend-item';
        if (student.student_id == currentStudentId) {
          li.classList.add('active'); // Highlight current
        }

        li.innerHTML = `
                    <img src="${student.profile_picture || '/assets/images/default-profile.png'}" alt="Profile" onerror="this.src='https://via.placeholder.com/40'">
                    <div class="message-content">
                        <div class="name-header">
                            <span class="friend-name">${student.student_name}</span>
                            <span class="time">${new Date(student.enrollment_date).toLocaleDateString()}</span>
                        </div>
                        <p class="last-message">${student.course_title}</p>
                    </div>
                `;

        li.addEventListener('click', () => {
          // Navigate to this student's progress
          window.location.href = `/html/teacherProgress.html?courseId=${student.course_id}&studentId=${student.student_id}`;
        });

        listContainer.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading sidebar students:", error);
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
    const response = await fetch(`${API_BASE_URL}/teacher_progress.php?action=students-progress&course_id=${currentCourseId}`);
    const result = await response.json();

    if (!result.success) {
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
    if (courseSub) courseSub.textContent = `${result.total_students} students enrolled`;

    // Display students list
    displayStudentsList(result.students, result.course_title);

  } catch (error) {
    console.error('Error loading students progress:', error);
    showError('Failed to load students progress');
  }
}

/**
 * Display list of all students with their progress
 */
function displayStudentsList(students, courseTitle) {
  // ... (No change needed here ideally, but for safety I can't leave hole)
  // Actually I will keep this function as is in the file if I don't select it.
}

/**
 * Load detailed progress for a specific student
 */
async function loadStudentDetails() {
  try {
    const response = await fetch(`${API_BASE_URL}/teacher_progress.php?action=student-assignments&course_id=${currentCourseId}&student_id=${currentStudentId}`);
    const result = await response.json();

    if (!result.success) {
      showError(result.message || 'Failed to load student details');
      return;
    }

    // Update header
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) headerTitle.textContent = result.course_title;

    const userElement = document.querySelector('.user');
    if (userElement) userElement.textContent = result.student.student_name;

    // Update sidebar
    const courseTitle = document.querySelector('.course-title');
    if (courseTitle) courseTitle.textContent = result.course_title;

    const courseSub = document.querySelector('.course-sub');
    if (courseSub) courseSub.textContent = `Student: ${result.student.student_name}`;

    // Display student progress
    displayStudentProgress(result);

  } catch (error) {
    console.error('Error loading student details:', error);
    showError('Failed to load student details');
  }
}

/**
 * Display detailed progress for a specific student
 */
function displayStudentProgress(data) {
  const main = document.querySelector('main');
  if (!main) return;

  const stats = data.stats;
  const student = data.student;

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
        <span>Course progress - ${student.student_name}</span>
        <span>${Math.round(student.progress_percentage)}% complete</span>
      </div>
      <div class="progress-bar">
        <div style="width: ${student.progress_percentage}%"></div>
      </div>
      <p class="stats">
        Videos watched: <b>${stats.watched_videos} / ${stats.total_videos}</b> &nbsp; | &nbsp;
        Assignments: <b>${stats.graded_assignments} graded</b> &nbsp; | &nbsp;
        Average mark: <b>${stats.average_mark}%</b>
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




// Helper: Show Error
function showError(message) {
  console.error(message);
  // You could replace this with a nice UI toast/alert
  alert(message);
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


