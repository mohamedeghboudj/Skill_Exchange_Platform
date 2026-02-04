// const chatToggle = document.querySelector(".chat-toggle");
// const sidebar = document.querySelector(".sidebar");
// const closeChat = document.querySelector(".close-chat");
// const leftArrow=document.getElementById("left-arrow")


// chatToggle.onclick = () => {
//   sidebar.classList.add("active");
// };

// closeChat.onclick = () => {
//   sidebar.classList.remove("active");
// };
// leftArrow.addEventListener('click',()=>{
//   window.location.href="/html/learn.html";
// })
// Configuration
const API_BASE_URL = 'http://localhost:8000/assets/php';
let currentStudentId = null;
let currentCourseId = null;

// DOM Elements
const leftArrow = document.getElementById("left-arrow");

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get student ID from session
    const userResponse = await fetch(`${API_BASE_URL}/getCurrentUser.php`);
    const userData = await userResponse.json();

    if (!userData.success) {
      showError('Please log in to view your progress');
      return;
    }

    currentStudentId = userData.user.id;

    // Get course ID from URL parameter (required)
    const urlParams = new URLSearchParams(window.location.search);
    currentCourseId = urlParams.get('courseId');

    if (!currentCourseId) {
      showError('Course ID is required. Please select a course from your chat.');
      return;
    }

    // Load all progress data
    await loadCourseProgress();
    await loadVideoProgress();
    await loadAssignments();
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize page. Please try again.');
  }
});

// Navigate back
if (leftArrow) {
  leftArrow.addEventListener('click', () => {
    window.location.href = "/html/learn.html";
  });
}

// Load course progress data
async function loadCourseProgress() {
  try {
    const response = await fetch(`${API_BASE_URL}/get_course_progress.php?student_id=${currentStudentId}&course_id=${currentCourseId}`);
    const result = await response.json();

    if (result.success) {
      const { enrollment, total_videos, assignment_stats } = result.data;

      // Update header
      const headerTitle = document.querySelector('header h1');
      const userElement = document.querySelector('.user');

      if (headerTitle) headerTitle.textContent = enrollment.course_title;
      if (userElement) userElement.textContent = enrollment.teacher_name;

      // Update sidebar course info (static chat area remains as HTML)
      const courseTitle = document.querySelector('.course-title');
      const courseSub = document.querySelector('.course-sub');

      if (courseTitle) courseTitle.textContent = enrollment.course_title;
      if (courseSub) courseSub.textContent = `With ${enrollment.teacher_name}`;

      // Update progress percentage
      const progressPercentage = Math.round(enrollment.progress_percentage);
      const progressHeader = document.querySelector('.progress-header span:last-child');
      const progressBar = document.querySelector('.progress-bar div');

      if (progressHeader) progressHeader.textContent = `${progressPercentage}% complete`;
      if (progressBar) progressBar.style.width = `${progressPercentage}%`;

      // Update stats
      const statsElement = document.querySelector('.stats');
      const doneCount = assignment_stats.done;
      const missedCount = assignment_stats.missed;
      const avgMark = assignment_stats.average_mark;

      if (statsElement) {
        statsElement.innerHTML = `
                    Videos watched: <b>${enrollment.videos_watched} / ${total_videos}</b> &nbsp; | &nbsp;
                    Assignments: <b>${doneCount} done · ${missedCount} missed</b> &nbsp; | &nbsp;
                    Average mark: <b>${avgMark}%</b>
                `;
      }
    }
  } catch (error) {
    console.error('Error loading course progress:', error);
    showError('Failed to load course progress');
  }
}

// Load video progress
async function loadVideoProgress() {
  try {
    const response = await fetch(`${API_BASE_URL}/get_video_progress.php?course_id=${currentCourseId}&student_id=${currentStudentId}`);
    const result = await response.json();

    if (result.success) {
      const stepper = document.querySelector('.stepper');
      if (!stepper) return;

      stepper.innerHTML = '';

      result.data.forEach((video, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = `step ${video.status}`;
        stepDiv.innerHTML = `
                    <span class="circle"></span>
                    <p>${video.video_title}</p>
                `;

        // Add click event to watch video (only for active videos)
        if (video.status === 'active') {
          stepDiv.style.cursor = 'pointer';
          stepDiv.addEventListener('click', () => watchVideo(video.video_id));
        }

        stepper.appendChild(stepDiv);
      });
    }
  } catch (error) {
    console.error('Error loading video progress:', error);
    showError('Failed to load video progress');
  }
}

// Load assignments
async function loadAssignments() {
  try {
    const response = await fetch(`${API_BASE_URL}/get_assignments.php?student_id=${currentStudentId}&course_id=${currentCourseId}`);
    const result = await response.json();

    if (result.success) {
      const container = document.querySelector('.progress-box:last-child');
      if (!container) return;

      // Clear existing rows except the header
      const rows = container.querySelectorAll('.row');
      rows.forEach(row => row.remove());

      result.data.forEach(assignment => {
        const rowDiv = document.createElement('div');
        rowDiv.className = `row ${assignment.status}`;

        let scoreDisplay;
        if (assignment.status === 'done') {
          scoreDisplay = `${assignment.score} / ${assignment.max_score}`;
        } else if (assignment.status === 'pending') {
          scoreDisplay = 'Pending';
        } else if (assignment.status === 'missed') {
          scoreDisplay = `0 / ${assignment.max_score}`;
        } else {
          scoreDisplay = 'Locked';
        }

        rowDiv.innerHTML = `
                    <span>${assignment.assignment_title}</span>
                    <span>${scoreDisplay}</span>
                `;

        container.appendChild(rowDiv);
      });
    }
  } catch (error) {
    console.error('Error loading assignments:', error);
    showError('Failed to load assignments');
  }
}

// Watch video (mark as completed)
async function watchVideo(videoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/mark_video_watched.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_id: currentStudentId,
        video_id: videoId,
        course_id: currentCourseId
      })
    });

    const result = await response.json();

    if (result.success) {
      // Reload progress data
      await loadCourseProgress();
      await loadVideoProgress();

      showSuccess('Video marked as watched!');
    }
  } catch (error) {
    console.error('Error marking video as watched:', error);
    showError('Failed to update video status');
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