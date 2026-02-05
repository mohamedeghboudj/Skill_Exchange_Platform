const chatToggle = document.querySelector(".chat-toggle");
const sidebar = document.querySelector(".sidebar");
const closeChat = document.querySelector(".close-chat");
const leftArrow = document.getElementById("left-arrow")


chatToggle.onclick = () => {
  sidebar.classList.add("active");
};

closeChat.onclick = () => {
  sidebar.classList.remove("active");
};
leftArrow.addEventListener('click', () => {
  window.location.href = "/html/learn.html";
})

// ========== ADDED CODE FOR DYNAMIC CHAT INFO -----hadil----- ==========
// Function to get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to load chat information for student view
// Remove the getUrlParameter function - no longer needed

// Updated function to load chat information from session
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

      // Update course title in header
      const headerTitle = document.querySelector('header h1');
      if (headerTitle) {
        headerTitle.textContent = data.course_title;
      }

      // Update course title in sidebar
      const sidebarCourseTitle = document.querySelector('.sidebar .course-title');
      if (sidebarCourseTitle) {
        sidebarCourseTitle.textContent = data.course_title;
      }

      // Update teacher name in sidebar
      const sidebarCourseSub = document.querySelector('.sidebar .course-sub');
      if (sidebarCourseSub) {
        sidebarCourseSub.textContent = `With ${data.teacher_name}`;
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

      console.log('Chat info loaded successfully');
    } else {
      console.error('Error loading chat info:', result.message);
      // Redirect back to learn page if no active chat
      alert('Please select a chat first');
      window.location.href = '/html/learn.html';
    }
  } catch (error) {
    console.error('Error fetching chat info:', error);
    alert('Error loading chat information');
  }
}

// Keep the DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', loadStudentChatInfo);

// Load chat information when page loads
document.addEventListener('DOMContentLoaded', loadStudentChatInfo);
// ========== END OF ADDED CODE ==========