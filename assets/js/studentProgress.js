
// const chatToggle = document.querySelector(".chat-toggle");
// const sidebar = document.querySelector(".sidebar");
// const closeChat = document.querySelector(".close-chat");
// const leftArrow=document.getElementById("left-arrow")

console.log("js is working");

const chatToggle = document.querySelector(".chat-toggle");
const sidebar = document.querySelector(".sidebar");
const closeChat = document.querySelector(".close-chat");
const leftArrow = document.getElementById("left-arrow");
const rate = document.getElementById("rateCourse");


chatToggle.onclick = () => sidebar.classList.add("active");
closeChat.onclick = () => sidebar.classList.remove("active");
leftArrow.addEventListener('click', () => window.location.href = "/html/dashboard.html");


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

    // Load Sidebar (My Instructors/Courses)
    await loadSidebarInstructors();

  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize page. Please try again.');
  }
});

/**
 * Load Sidebar with My Instructors/Courses
 */
async function loadSidebarInstructors() {
  const listContainer = document.querySelector('.list-friend');
  if (!listContainer) return;

  try {
    const response = await fetch(`${API_BASE_URL}/student_progress.php?action=get_my_instructors`);
    const result = await response.json();

    if (result.success && result.instructors.length > 0) {
      listContainer.innerHTML = ''; // Clear hardcoded items

      result.instructors.forEach(instructor => {
        const li = document.createElement('li');
        li.className = 'friend-item';
        if (instructor.course_id == currentCourseId) {
          li.classList.add('active'); // Highlight current
        }

        li.innerHTML = `
                    <img src="${instructor.profile_picture || '/assets/images/default-profile.png'}" alt="Profile" onerror="this.src='https://via.placeholder.com/40'">
                    <div class="message-content">
                        <div class="name-header">
                            <span class="friend-name">${instructor.teacher_name}</span>
                            <span class="time">Active</span>
                        </div>
                        <p class="last-message">${instructor.course_title}</p>
                    </div>
                `;

        li.addEventListener('click', () => {
          // Navigate to this course's progress
          window.location.href = `/html/studentProgress.html?courseId=${instructor.course_id}`;
        });

        listContainer.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading sidebar instructors:", error);
  }
}

// Navigate back
if (leftArrow) {
  leftArrow.addEventListener('click', () => {
    window.location.href = "/html/learn.html";
  });
}

// Load course progress data
async function loadCourseProgress() {
  try {
    const response = await fetch(`${API_BASE_URL}/student_progress.php?action=course-progress&student_id=${currentStudentId}&course_id=${currentCourseId}`);
    const result = await response.json();

    if (result.success) {
      const { enrollment, total_videos, assignment_stats } = result.data || result; // Handle potential structure diffs if any

      // Note: The structure returned by getCourseProgressOverview matches the expectations mostly
      // BUT getCourseProgressOverview returns flat object, not nested 'enrollment'.
      // Let's check student_progress.php line 75 return.
      // It returns: success, student_id, course_id, course_title, overall_completion, videos_watched...
      // Previous JS expected: result.data.enrollment...
      // I need to adjust JS or PHP. Adjusting JS is safer here.

      const data = result; // The result IS the data in PHP implementation

      // Update header
      const headerTitle = document.querySelector('header h1');
      const userElement = document.querySelector('.user');

      if (headerTitle) headerTitle.textContent = data.course_title;
      // if (userElement) userElement.textContent = enrollment.teacher_name; // teacher_name not returned by PHP currently

      // Update sidebar course info
      const courseTitle = document.querySelector('.course-title');
      const courseSub = document.querySelector('.course-sub');

      if (courseTitle) courseTitle.textContent = data.course_title;
      // if (courseSub) courseSub.textContent = `With ${enrollment.teacher_name}`;

      // Update progress percentage
      const progressPercentage = Math.round(data.overall_completion);
      const progressHeader = document.querySelector('.progress-header span:last-child');
      const progressBar = document.querySelector('.progress-bar div');

      if (progressHeader) progressHeader.textContent = `${progressPercentage}% complete`;
      if (progressBar) progressBar.style.width = `${progressPercentage}%`;

      // Update stats
      const statsElement = document.querySelector('.stats');
      // assignment_stats are NOT returned by getCourseProgressOverview in PHP yet.
      // I might need to rely on loadAssignments to update this part or update PHP.
      // For now, let's skip assignment stats in this function if data is missing.

      if (statsElement) {
        statsElement.innerHTML = `
            Videos watched: <b>${data.videos_watched} / ${data.total_videos}</b>
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
    const response = await fetch(`${API_BASE_URL}/student_progress.php?action=video-timeline&course_id=${currentCourseId}&student_id=${currentStudentId}`);
    const result = await response.json();

    if (result.success) {
      const stepper = document.querySelector('.stepper');
      if (!stepper) return;

      stepper.innerHTML = '';

      // PHP returns 'video_steps' array
      const videos = result.video_steps || result.data || [];

      videos.forEach((video, index) => {
        const stepDiv = document.createElement('div');
        // Map PHP status (watched, not_yet, locked) to CSS classes (completed, active, etc)
        // CSS expects: completed, active, or plain (locked).
        let cssClass = 'step';
        if (video.status === 'watched') cssClass += ' completed';
        else if (video.status === 'not_yet') cssClass += ' active';
        // else locked/plain

        stepDiv.className = cssClass;
        stepDiv.innerHTML = `
                    <span class="circle"></span>
                    <p>${video.video_title}</p>
                `;

        // Add click event to watch video
        if (video.status !== 'locked') {
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
    const response = await fetch(`${API_BASE_URL}/student_progress.php?action=get-assignments&student_id=${currentStudentId}&course_id=${currentCourseId}`);
    const result = await response.json(); // Expect { success: true, data: [...], stats: {...} }

    if (result.success) {
      const container = document.querySelector('.progress-box:last-child');
      if (!container) return;

      // Clear existing rows except the header
      const rows = container.querySelectorAll('.row');
      rows.forEach(row => row.remove());

      const assignments = result.data;
      const stats = result.stats;

      assignments.forEach(assignment => {
        const rowDiv = document.createElement('div');
        rowDiv.className = `row ${assignment.status} assignment`; // Added 'assignment' class explicitly to be safe
        rowDiv.dataset.id = assignment.id; // CRITICAL for click handlers

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

      // Update stats if we skipped it in courseProgress
      const statsElement = document.querySelector('.stats');
      if (statsElement && stats) {
        // Append to existing content or rewrite? 
        // PHP getCourseProgressOverview return videos_watched but not assignment stats.
        // So we should merge.
        // For simplicity, let's just append or update the Assignment part if possible.
        // Actually, let's just rewrite the whole stats line if we can match the video stats.
        // But I don't have video stats here.
        // Hack: Append to innerHTML? No, that's messy.
        // Ideally fetch both and update once.
        // Given the structure, I'll validly assume the user wants to see the stats.
        // I will look for existing text and replace the Assignments part using Regex? 
        // Or just leave it for now as it's a minor UI detail compared to submission functionality.

        const currentText = statsElement.innerHTML;
        if (!currentText.includes('Assignments:')) {
          statsElement.innerHTML += ` | Assignments: <b>${stats.done} done · ${stats.missed} missed</b> | Average mark: <b>${stats.average_mark}%</b>`;
        }
      }

      // CRITICAL: Attach handlers AFTER creating elements
      attachStudentAssignmentHandlers();
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

function attachStudentAssignmentHandlers() {
  const assignments = document.querySelectorAll(".assignment");
  const submissionPanel = document.getElementById("submission-panel");
  const submissionPdf = document.querySelector(".submission-pdf");
  const fileUploadArea = document.querySelector(".file-upload-area");
  const submitBox = document.querySelector(".submit-box");

  assignments.forEach(assignment => {
    const assignmentId = assignment.dataset.id;
    const isPending = assignment.classList.contains('pending');
    const isDone = assignment.classList.contains('done');

    // Allow pending assignments even without data-id (though now they should have it)
    if ((assignmentId && isDone) || isPending) {
      assignment.style.cursor = 'pointer';

      assignment.addEventListener('click', () => {
        const titleSpan = assignment.querySelector("span:first-child");
        document.getElementById("assignment-title").textContent = titleSpan.textContent;
        // Store ID for submission
        if (assignmentId) {
          submissionPanel.dataset.assignmentId = assignmentId;
        }

        // Check current state (in case it was just submitted)
        const isCurrentlyDone = assignment.classList.contains('done');
        const isCurrentlyPending = assignment.classList.contains('pending');

        if (isCurrentlyDone) {
          // Show PDF viewer for done assignments
          submissionPdf.style.display = "flex";
          fileUploadArea.style.display = "none";
          submitBox.style.display = "none";
        } else if (isCurrentlyPending) {
          // Show upload form for pending
          submissionPdf.style.display = "none";
          fileUploadArea.style.display = "block";
          submitBox.style.display = "block";
        }

        submissionPanel.style.display = "block";
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Student Progress loaded");
  attachStudentAssignmentHandlers();

  // File upload preview
  const fileInput = document.getElementById("file-input");
  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        document.getElementById("file-name").textContent = file.name;
        document.getElementById("file-size").textContent = (file.size / 1024).toFixed(1) + " KB";
        document.getElementById("file-preview").style.display = "flex";
      }
    });
  }

  // Submit assignment
  const submitBtn = document.getElementById("submit-assignment");
  if (submitBtn) {
    submitBtn.addEventListener("click", async function () {
      const fileInput = document.getElementById("file-input");
      if (fileInput.files.length === 0) {
        alert("Please select a file!");
        return;
      }

      // Identify which assignment is being submitted
      const assignmentTitle = document.getElementById("assignment-title").textContent;

      // We need the ID. The DOM structure for submission-panel doesn't store the ID currently.
      // We must store it when opening the panel.
      // In attachStudentAssignmentHandlers, we set title. We should also set a data-attribute on the panel.
      const submissionPanel = document.getElementById("submission-panel");
      const assignmentId = submissionPanel.dataset.assignmentId;

      if (!assignmentId) {
        alert("Error: Assignment ID not found.");
        return;
      }

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('assignment_id', assignmentId);
      formData.append('action', 'submit-assignment');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        const response = await fetch(`${API_BASE_URL}/student_progress.php`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          alert("Assignment submitted successfully!");

          // Reload assignments to update UI
          await loadAssignments();

          // Hide panel
          document.getElementById("submission-panel").style.display = "none";
          fileInput.value = "";
          document.getElementById("file-preview").style.display = "none";

        } else {
          alert(result.message || "Submission failed");
        }
      } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred during submission.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Assignment";
      }
    });
  }
});

rate.addEventListener('click', () => {
  window.location.href = "/ratcourse.htm";
})

