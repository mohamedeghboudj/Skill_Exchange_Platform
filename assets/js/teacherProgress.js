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

  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize page. Please try again.');
  }
});

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
    const response = await fetch(`${API_BASE_URL}/get_teacher_progress.php?action=get_students_progress&course_id=${currentCourseId}`);
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
  const main = document.querySelector('main');
  if (!main) return;

  // Clear existing content
  main.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-left-icon lucide-move-left" id="left-arrow">
      <path d="M6 8L2 12L6 16"/><path d="M2 12H22"/>
    </svg>
    
    <div class="progress-box">
      <h2>${courseTitle} - Student Progress</h2>
      <p class="stats">Total students: <b>${students.length}</b></p>
    </div>
    
    <div class="progress-box" id="students-list">
      <h3>Students</h3>
    </div>
  `;

  const studentsList = document.getElementById('students-list');

  if (students.length === 0) {
    studentsList.innerHTML += '<p style="padding: 20px; text-align: center; color: #666;">No students enrolled yet</p>';
    return;
  }

  students.forEach(student => {
    const studentRow = document.createElement('div');
    studentRow.className = 'row student-row';
    studentRow.style.cursor = 'pointer';
    studentRow.innerHTML = `
      <div style="flex: 1;">
        <strong>${student.student_name}</strong>
        <br><small style="color: #666;">${student.email}</small>
      </div>
      <div style="text-align: right;">
        <strong>${Math.round(student.progress_percentage)}%</strong>
        <br><small style="color: #666;">
          Videos: ${student.videos_watched}/${student.total_videos} | 
          Assignments: ${student.assignments_completed}/${student.total_assignments}
        </small>
      </div>
    `;

    // Make clickable to view details
    studentRow.addEventListener('click', () => {
      window.location.href = `/html/teacherProgress.html?courseId=${currentCourseId}&studentId=${student.student_id}`;
    });

    studentsList.appendChild(studentRow);
  });
}

/**
 * Load detailed progress for a specific student
 */
async function loadStudentDetails() {
  try {
    const response = await fetch(`${API_BASE_URL}/get_teacher_progress.php?action=get_student_details&course_id=${currentCourseId}&student_id=${currentStudentId}`);
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

      if (assignment.status === 'done') {
        statusClass = 'done';
        scoreDisplay = `${assignment.score} / ${assignment.max_score}`;
      } else if (assignment.status === 'pending') {
        statusClass = 'pending';
        scoreDisplay = 'Pending Review';
      } else if (assignment.status === 'missed') {
        statusClass = 'missed';
        scoreDisplay = `0 / ${assignment.max_score}`;
      } else {
        statusClass = 'locked';
        scoreDisplay = 'Not Submitted';
      }

      rowDiv.className = `row ${statusClass}`;
      rowDiv.innerHTML = `
        <span>${assignment.assignment_title}</span>
        <span>${scoreDisplay}</span>
      `;

      assignmentsList.appendChild(rowDiv);
    });
  } else if (assignmentsList) {
    assignmentsList.innerHTML = '<p style="padding: 20px; color: #666;">No assignments in this course</p>';
  }
}

// Helper functions
function showError(message) {
  console.error(message);
  alert(message);
}

function showSuccess(message) {
  console.log(message);
  // You can implement a toast notification here
}

leftArrow.addEventListener('click', () => {
  window.location.href = "/html/teach.html";
});

// Function to attach click handlers to assignments
function attachAssignmentClickHandlers() {
  const assignments = document.querySelectorAll(".assignment");
  const saveButton = document.querySelector("#save-grade");
  const score = document.querySelector("#score-input");
  console.log("Assignments found:", assignments.length);

  const gradingPanel = document.getElementById("grading-panel");

  assignments.forEach(assignment => {
    const assignmentId = assignment.dataset.id;
    const isLocked = assignment.classList.contains('locked');
    const isPending = assignment.classList.contains('pending');

    if (assignmentId && !isLocked && !isPending) {
      assignment.style.cursor = 'pointer';

      assignment.addEventListener('click', () => {
        // Update title and show correct panel
        document.getElementById("assignment-title").textContent = assignment.querySelector("span").textContent;
        gradingPanel.style.display = "block";
      });

      // Hover effects
      assignment.addEventListener('mouseenter', () => {
        assignment.style.transform = 'translateX(5px)';
        assignment.style.transition = 'transform 0.2s ease';
      });

      assignment.addEventListener('mouseleave', () => {
        assignment.style.transform = 'translateX(0)';
      });
      saveButton.addEventListener('click', () => {
        score.value = "";
      })
    }
  });
}




// Event for unlock spans in locked assignments
document.addEventListener("DOMContentLoaded", () => {
  console.log("JS is running");
  attachAssignmentClickHandlers();

  const assignmentsContainer = document.querySelector('.progress-box:last-of-type'); // Assignments section
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
});


leftArrow.addEventListener('click', () => {
  window.location.href = "/html/teach.html";
});

// ========== UPDATED CODE FOR DYNAMIC CHAT INFO (Session-Based) ==========

// Function to load chat information from session (teacher view)
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

      // Update course title in header
      const headerTitle = document.querySelector('header h1');
      if (headerTitle) {
        headerTitle.textContent = data.course_title;
      }

      // Update course title in chat header
      const chatCourseTitle = document.querySelector('#chat-header .course-title');
      if (chatCourseTitle) {
        chatCourseTitle.textContent = data.course_title;
      }

      // Update student name in chat header
      const chatCourseSub = document.querySelector('#chat-header .course-sub');
      if (chatCourseSub) {
        chatCourseSub.textContent = `student ${data.student_name}`;
      }

      // Update student name in top right corner
      const userDiv = document.querySelector('.user');
      if (userDiv) {
        userDiv.textContent = data.student_name;
      }

      // Update progress percentage if available
      if (data.progress_percentage) {
        const progressBar = document.querySelector('.progress-bar div');
        const progressText = document.querySelector('.progress-header span:last-child');

        if (progressBar) {
          progressBar.style.width = data.progress_percentage + '%';
        }
        if (progressText) {
          progressText.textContent = data.progress_percentage + '% complete';
        }
      }

      console.log('Teacher chat info loaded successfully');
    } else {
      console.error('Error loading chat info:', result.message);
      // Redirect back to teach page if no active chat
      alert('Please select a student first');
      window.location.href = '/html/teach.html';
    }
  } catch (error) {
    console.error('Error fetching teacher chat info:', error);
    alert('Error loading chat information');
  }
}

// Load chat information when page loads
document.addEventListener('DOMContentLoaded', loadTeacherChatInfo);

