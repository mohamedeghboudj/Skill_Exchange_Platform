const chatToggle = document.querySelector(".chat-toggle");
const sidebar = document.querySelector(".sidebar");
const closeChat = document.querySelector(".close-chat");
const leftArrow = document.getElementById("left-arrow");

chatToggle.onclick = () => {
  sidebar.classList.add("active");
};

closeChat.onclick = () => {
  sidebar.classList.remove("active");
};

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