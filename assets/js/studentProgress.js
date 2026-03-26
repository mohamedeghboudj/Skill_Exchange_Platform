


console.log("js is working");

const chatToggle = document.querySelector(".chat-toggle");
const sidebar = document.querySelector(".sidebar");
const closeChat = document.querySelector(".close-chat");

const leftArrow = document.getElementById("left-arrow");
const rate = document.getElementById("rateCourse");



chatToggle.onclick = () => sidebar.classList.add("active");
closeChat.onclick = () => sidebar.classList.remove("active");
leftArrow.addEventListener('click', () => window.location.href = "/html/dashboard.html");



let currentStudentId = null;
let currentCourseId = null;




document.addEventListener('DOMContentLoaded', async () => {
  console.log('[StudentProgress] Page loaded, initializing...');
  try {
 
    const userResponse = await fetch(`../assets/php/getCurrentUser.php`);
    const userData = await userResponse.json();

    if (!userData.success) {
      console.warn('[StudentProgress] Not logged in');
      showError('Please log in to view your progress');
      return;
    }

    currentStudentId = userData.user.id;
    console.log('[StudentProgress] Student ID:', currentStudentId);

   
    const urlParams = new URLSearchParams(window.location.search);
    currentCourseId = urlParams.get('courseId');

    console.log('[StudentProgress] URL param - courseId:', currentCourseId);

   
    if (!currentCourseId) {
      console.log('[StudentProgress] courseId missing from URL, trying session recovery...');
      const sessionData = await loadStudentChatInfo();
      if (sessionData && sessionData.course_id) {
        currentCourseId = sessionData.course_id;
        console.log('[StudentProgress] Recovered from session - courseId:', currentCourseId);
      }
    }

    if (!currentCourseId) {
      console.warn('[StudentProgress] courseId required but not found in URL or session');
      showError('Course ID is required. Please select a course from your chat.');
      return;
    }

   
    await initializeView();
    console.log('[StudentProgress] Init complete');

  } catch (error) {
    console.error('[StudentProgress] Initialization error:', error);
    showError('Failed to initialize page. Please try again.');
  }
});


async function initializeView() {
 
  await loadCourseProgress();
  await loadVideoProgress();
  await loadAssignments();

  
  await loadSidebarInstructors();
}


async function loadSidebarInstructors() {
  const listContainer = document.querySelector('.list-friend');
  if (!listContainer) return;

  try {
    const response = await fetch(`../assets/php/student_progress.php?action=get_my_instructors`);
    const result = await response.json();

    if (result.success && result.instructors.length > 0) {
      listContainer.innerHTML = ''; 

      result.instructors.forEach(instructor => {
        const li = document.createElement('li');
        li.className = 'friend-item';
        if (instructor.course_id == currentCourseId) {
          li.classList.add('active'); 
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
         
          window.location.href = `/html/studentProgress.html?courseId=${instructor.course_id}`;
        });

        listContainer.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading sidebar instructors:", error);
  }
}


if (leftArrow) {
  leftArrow.addEventListener('click', () => {
    window.location.href = "/html/learn.html";
  });
}


async function loadCourseProgress() {
  try {
    const response = await fetch(`../assets/php/student_progress.php?action=course-progress&student_id=${currentStudentId}&course_id=${currentCourseId}`);
    const result = await response.json();

    if (result.success) {
      const { enrollment, total_videos, assignment_stats } = result.data || result; // Handle potential structure diffs if any

     

      const data = result; 

      const headerTitle = document.querySelector('header h1');
      const userElement = document.querySelector('.user');

      if (headerTitle) headerTitle.textContent = data.course_title;
     

     
      const courseTitle = document.querySelector('.course-title');
      const courseSub = document.querySelector('.course-sub');

      if (courseTitle) courseTitle.textContent = data.course_title;
   

  
      const progressPercentage = Math.round(data.overall_completion);
      const progressHeader = document.querySelector('.progress-header span:last-child');
      const progressBar = document.querySelector('.progress-bar div');

      if (progressHeader) progressHeader.textContent = `${progressPercentage}% complete`;
      if (progressBar) progressBar.style.width = `${progressPercentage}%`;

   
      const statsElement = document.querySelector('.stats');
     

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


async function loadVideoProgress() {
  try {
    const response = await fetch(`../assets/php/student_progress.php?action=video-timeline&course_id=${currentCourseId}&student_id=${currentStudentId}`);
    const result = await response.json();

    if (result.success) {
      const stepper = document.querySelector('.stepper');
      if (!stepper) return;

      stepper.innerHTML = '';

      
      const videos = result.video_steps || result.data || [];

      
      stepper.style.gridTemplateColumns = `repeat(${videos.length}, 1fr)`;

      let foundActive = false;
      videos.forEach((video, index) => {
        const stepDiv = document.createElement('div');
        

        let cssClass = 'step';
        if (video.status === 'watched') {
          cssClass += ' completed';
        } else if (!foundActive) {
          cssClass += ' active';
          foundActive = true;
          video.status = 'active'; 
        } else {
          video.status = 'locked'; 
        }

        stepDiv.className = cssClass;
        stepDiv.innerHTML = `
                    <span class="circle"></span>
                    <p>${video.video_title}</p>
                `;

        
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


async function loadAssignments() {
  try {
    const response = await fetch(`../assets/php/student_progress.php?action=get-assignments&student_id=${currentStudentId}&course_id=${currentCourseId}`);
    const result = await response.json(); 

    if (result.success) {
      const container = document.querySelector('.progress-box:last-child');
      if (!container) return;

      
      const rows = container.querySelectorAll('.row');
      rows.forEach(row => row.remove());

      const assignments = result.data;
      const stats = result.stats;

      assignments.forEach(assignment => {
        const rowDiv = document.createElement('div');
        rowDiv.className = `row ${assignment.status} assignment`; 
        rowDiv.dataset.id = assignment.id; 
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

     
      const statsElement = document.querySelector('.stats');
      if (statsElement && stats) {
       

        const currentText = statsElement.innerHTML;
        if (!currentText.includes('Assignments:')) {
          statsElement.innerHTML += ` | Assignments: <b>${stats.done} done · ${stats.missed} missed</b> | Average mark: <b>${stats.average_mark}%</b>`;
        }
      }

     
      attachStudentAssignmentHandlers();
    }
  } catch (error) {
    console.error('Error loading assignments:', error);
    showError('Failed to load assignments');
  }
}


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
    
      await loadCourseProgress();
      await loadVideoProgress();

      showSuccess('Video marked as watched!');
    }
  } catch (error) {
    console.error('Error marking video as watched:', error);
    showError('Failed to update video status');
  }
}


function showError(message) {
  console.error(message);
  alert(message);
}

function showSuccess(message) {
  console.log(message);
 
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

    
    if ((assignmentId && isDone) || isPending) {
      assignment.style.cursor = 'pointer';

      assignment.addEventListener('click', () => {
        const titleSpan = assignment.querySelector("span:first-child");
        document.getElementById("assignment-title").textContent = titleSpan.textContent;
        
        if (assignmentId) {
          submissionPanel.dataset.assignmentId = assignmentId;
        }

        
        const isCurrentlyDone = assignment.classList.contains('done');
        const isCurrentlyPending = assignment.classList.contains('pending');

        if (isCurrentlyDone) {
         
          submissionPdf.style.display = "flex";
          fileUploadArea.style.display = "none";
          submitBox.style.display = "none";
        } else if (isCurrentlyPending) {
         
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

  
  const submitBtn = document.getElementById("submit-assignment");
  if (submitBtn) {
    submitBtn.addEventListener("click", async function () {
      const fileInput = document.getElementById("file-input");
      if (fileInput.files.length === 0) {
        alert("Please select a file!");
        return;
      }

      
      const assignmentTitle = document.getElementById("assignment-title").textContent;

     
     
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

        const response = await fetch(`../assets/php/student_progress.php`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          alert("Assignment submitted successfully!");

          
          await loadAssignments();

          
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


function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}


async function loadStudentChatInfo() {
  try {
    const response = await fetch(
      `../api/get_chat_info.php?action=get_student_chat_info`,
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

    
      const headerTitle = document.querySelector('header h1');
      if (headerTitle) {
        headerTitle.textContent = data.course_title;
      }

      
      const sidebarCourseTitle = document.querySelector('.sidebar .course-title');
      if (sidebarCourseTitle) {
        sidebarCourseTitle.textContent = data.course_title;
      }

      
      const sidebarCourseSub = document.querySelector('.sidebar .course-sub');
      if (sidebarCourseSub) {
        sidebarCourseSub.textContent = `With ${data.teacher_name}`;
      }

     
      const userDiv = document.querySelector('.user');
      if (userDiv) {
        userDiv.textContent = data.student_name;
      }

      console.log('[StudentProgress] Chat info loaded successfully');
      return data;
    } else {
      console.warn('[StudentProgress] Chat info: no active chat', result.message);
      return null;
    }
  } catch (error) {
    console.warn('[StudentProgress] Error fetching chat info:', error);
    return null;
  }
}

