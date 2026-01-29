//teach.js
// Import functions from courses.js and videos.js
console.log("js is working..");
import { getCourses, deleteCourse, addCourse } from './teach_courses.js';
import {
  getVideosByCourse,
  deleteMultipleVideos,
  addVideo,
  getAssignmentsByCourse,
  addAssignment,
  deleteAssignment
} from './teach_videos.js';

// State management
let deleteMode = {};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  setupPreExistingCourses();
  renderAllCourses();
  setupAddCourseButton();
});

// Remove all static HTML courses
function setupPreExistingCourses() {
  const existingCourses = document.querySelectorAll('.content .course');
  existingCourses.forEach(courseDiv => {
    courseDiv.remove();
  });
}

// Render all courses
function renderAllCourses() {
  const courses = getCourses();
  const contentDiv = document.querySelector('.content');

  courses.forEach(course => {
    const courseElement = createCourseElement(course);
    contentDiv.appendChild(courseElement);
  });

  // Add the "Add New Course" button at the end
  if (!document.querySelector('.add-course-container')) {
    const addCourseDiv = createAddCourseButton();
    contentDiv.appendChild(addCourseDiv);
  }
}

// Create course element
export function createCourseElement(course) {
  const videos = getVideosByCourse(course.id);
  const assignments = getAssignmentsByCourse(course.id);

  const courseDiv = document.createElement('div');
  courseDiv.className = 'course';
  courseDiv.setAttribute('data-course-id', course.id);
  courseDiv.style.animation = 'fadeIn 0.5s ease';

  courseDiv.innerHTML = `
    <div class="coursename">
      <h3>${course.title}</h3>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="#b7b4b4" 
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="lucide lucide-trash2-icon lucide-trash-2 delete-course-btn">
        <path d="M10 11v6" /><path d="M14 11v6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </div>
    
    <div class="videos">
      <div class="vdHead">
        <p>Course videos</p>
        <div class="edit-buttons">
          <button class="deletebtn delete-videos-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-circle-x-icon lucide-circle-x">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" /><path d="m9 9 6 6" />
            </svg>
            delete
          </button>
          <button class="addVd add-video-btn">+ Add</button>
        </div>
      </div>
      <div class="vdcards" data-course-id="${course.id}">
      ${videos.length > 0 ? videos.map(video => createVideoCard(video, course.id)).join('') : '<p style="color: #999; font-style: italic;">No videos yet</p>'}
      </div>
    </div>
    
    <div class="assignments">
      <p>Assignments</p>
        ${assignments.length > 0 ? assignments.map(assignment => createAssignmentCard(assignment, course.id)).join('') : '<p style="color: #999; font-style: italic;">No assignments yet</p>'}
      <div class="add-assignment-container" style="margin-top: 10px;">
        <button class="addAss add-assignment-btn" data-course-id="${course.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Assignment
        </button>
      </div>
    </div>
  `;

  // Setup event listeners
  setupCourseEventListeners(courseDiv, course.id);

  return courseDiv;
}

// Create video card HTML
function createVideoCard(video, courseId) {
  const isDeleteMode = deleteMode[courseId] || false;

  return `
    <div class="video" data-video-id="${video.id}" style="animation: slideIn 0.3s ease;">
      <div class="one">
        <div class="vd-background">
          <img src="${video.thumbnail}" alt="${video.title}">
        </div>
        <div class="vd-info">
          <div class="title">${video.title}</div>
        </div>
      </div>
      <div class="two">
        <input type="checkbox" class="video-checkbox" 
          style="display: ${isDeleteMode ? 'block' : 'none'};" 
          data-video-id="${video.id}"/>
      </div>
    </div>
  `;
}

// Create assignment card HTML - FIXED: Added click event to show PDF
function createAssignmentCard(assignment, courseId) {
  return `
    <div class="assignment" data-assignment-id="${assignment.id}" style="animation: slideIn 0.3s ease;">
      <div class="pdf assignment-file" data-file-url="${assignment.fileUrl}" style="cursor: pointer;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-file-icon lucide-file">
          <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
          <path d="M14 2v5a1 1 0 0 0 1 1h5" />
        </svg>
        ${assignment.title}
      </div>
      <div class="edit-buttons">
        <button class="deletebtn delete-assignment-btn" data-assignment-id="${assignment.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-circle-x-icon lucide-circle-x">
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" /><path d="m9 9 6 6" />
          </svg>
          delete
        </button>
      </div>
    </div>
  `;
}

// Setup event listeners for a course
function setupCourseEventListeners(courseDiv, courseId) {
  // Delete course button
  const deleteCourseBtn = courseDiv.querySelector('.delete-course-btn');
  deleteCourseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleDeleteCourse(courseId, courseDiv);
  });

  // Delete videos button
  const deleteVideosBtn = courseDiv.querySelector('.delete-videos-btn');
  deleteVideosBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // CRITICAL: Prevent event bubbling
    handleDeleteVideos(courseId, courseDiv);
  });

  // Add video button
  const addVideoBtn = courseDiv.querySelector('.add-video-btn');
  addVideoBtn.addEventListener('click', () => handleAddVideo(courseId, courseDiv));

  // Add assignment button
  const addAssignmentBtn = courseDiv.querySelector('.add-assignment-btn');
  addAssignmentBtn.addEventListener('click', () => handleAddAssignment(courseId, courseDiv));

  // FIXED: Add click event to view assignment files
  const assignmentFiles = courseDiv.querySelectorAll('.assignment-file');
  assignmentFiles.forEach(fileDiv => {
    fileDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      const fileUrl = fileDiv.getAttribute('data-file-url');
      if (fileUrl && fileUrl !== '') {
        window.open(fileUrl, '_blank');
      } else {
        alert('No file available for this assignment');
      }
    });
  });

  // Delete assignment buttons
  const deleteAssignmentBtns = courseDiv.querySelectorAll('.delete-assignment-btn');
  deleteAssignmentBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering file view
      const assignmentId = parseInt(btn.getAttribute('data-assignment-id'));
      handleDeleteSingleAssignment(assignmentId, courseDiv);
    });
  });
}

// Handle delete course
function handleDeleteCourse(courseId, courseDiv) {
  courseDiv.style.animation = 'fadeOut 0.3s ease';
  setTimeout(() => {
    deleteCourse(courseId);
    courseDiv.remove();
  }, 300);
}

// FIXED: Handle delete videos - Prevent immediate toggle
function handleDeleteVideos(courseId, courseDiv) {
  const vdcards = courseDiv.querySelector('.vdcards');
  const checkboxes = vdcards.querySelectorAll('.video-checkbox');
  const deleteBtn = courseDiv.querySelector('.delete-videos-btn');

  if (!deleteMode[courseId]) {
    // ENTER delete mode - show checkboxes
    deleteMode[courseId] = true;

    checkboxes.forEach(cb => {
      cb.style.display = 'block';
    });

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
      // DELETE selected videos
      deleteMultipleVideos(selectedIds);

      selectedIds.forEach(id => {
        const videoCard = vdcards.querySelector(`[data-video-id="${id}"]`);
        if (videoCard) {
          videoCard.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => videoCard.remove(), 300);
        }
      });

      // EXIT delete mode after deletion
      setTimeout(() => {
        deleteMode[courseId] = false;
        const remainingCheckboxes = vdcards.querySelectorAll('.video-checkbox');
        remainingCheckboxes.forEach(cb => cb.style.display = 'none');
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
        // If no videos remain, show placeholder
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
      // EXIT delete mode without deleting
      deleteMode[courseId] = false;
      checkboxes.forEach(cb => cb.style.display = 'none');
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
  }
}

// Handle add video
function handleAddVideo(courseId, courseDiv) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/mp4,video/webm,video/mov';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const videos = getVideosByCourse(courseId);
      const nextOrder = videos.length + 1;

      const newVideo = {
        courseId: courseId,
        title: `${String(nextOrder).padStart(2, '0')}.${file.name.replace(/\.[^/.]+$/, '')}`,
        thumbnail: "../assets/images/webdev.jpg",
        videoUrl: URL.createObjectURL(file),
        order: nextOrder
      };

      const addedVideo = addVideo(newVideo);

      const vdcards = courseDiv.querySelector('.vdcards');
      // Remove placeholder message if present (search by text to avoid matching the header)
      const placeholder = Array.from(vdcards.querySelectorAll('p')).find(p => /no videos yet/i.test(p.textContent));
      if (placeholder) {
        placeholder.style.animation = 'slideOut 0.25s ease';
        setTimeout(() => placeholder.remove(), 250);
      }
      const videoCard = document.createElement('div');
      videoCard.innerHTML = createVideoCard(addedVideo, courseId);
      vdcards.appendChild(videoCard.firstElementChild);
    }
  });

  input.click();
}

// Handle add assignment - FIXED: Only allow one assignment
function handleAddAssignment(courseId, courseDiv) {
  const assignments = getAssignmentsByCourse(courseId);
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.doc,.docx';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Determine assignment number based on existing assignments
      const currentAssignments = getAssignmentsByCourse(courseId);
      const assignmentNumber = currentAssignments.length + 1;

      const newAssignment = {
        courseId: courseId,
        title: `Assignment ${assignmentNumber}`,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file)
      };

      const addedAssignment = addAssignment(newAssignment);

      const assignmentsDiv = courseDiv.querySelector('.assignments');
      const addButtonContainer = assignmentsDiv.querySelector('.add-assignment-container');

      // Remove placeholder message if present (search by text to avoid matching the header)
      const placeholder = Array.from(assignmentsDiv.querySelectorAll('p')).find(p => /no assignments yet/i.test(p.textContent));
      if (placeholder) {
        placeholder.style.animation = 'slideOut 0.25s ease';
        setTimeout(() => placeholder.remove(), 250);
      }

      const assignmentCard = document.createElement('div');
      assignmentCard.innerHTML = createAssignmentCard(addedAssignment, courseId);

      const newAssignmentElement = assignmentCard.firstElementChild;
      assignmentsDiv.insertBefore(newAssignmentElement, addButtonContainer);

      // Setup listeners for new assignment
      const fileDiv = newAssignmentElement.querySelector('.assignment-file');
      fileDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        const fileUrl = fileDiv.getAttribute('data-file-url');
        if (fileUrl && fileUrl !== '') {
          window.open(fileUrl, '_blank');
        }
      });

      const deleteBtn = newAssignmentElement.querySelector('.delete-assignment-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteSingleAssignment(addedAssignment.id, courseDiv);
      });
    }
  });

  input.click();
}

// Handle delete single assignment
function handleDeleteSingleAssignment(assignmentId, courseDiv) {
  const assignmentCard = courseDiv.querySelector(`[data-assignment-id="${assignmentId}"]`);
  if (assignmentCard) {
    assignmentCard.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      deleteAssignment(assignmentId);
      assignmentCard.remove();
      // If no assignments remain, add placeholder
      const assignmentsDiv = courseDiv.querySelector('.assignments');
      const remainingAssignments = assignmentsDiv.querySelectorAll('.assignment');
      if (remainingAssignments.length === 0) {
        const placeholder = document.createElement('p');
        placeholder.style.color = '#999';
        placeholder.style.fontStyle = 'italic';
        placeholder.textContent = 'No assignments yet';
        const addButtonContainer = assignmentsDiv.querySelector('.add-assignment-container');
        assignmentsDiv.insertBefore(placeholder, addButtonContainer);
      }
    }, 300);
  }
}

// Create "Add New Course" button
function createAddCourseButton() {
  const addCourseDiv = document.createElement('div');
  addCourseDiv.className = 'add-course-container';
  addCourseDiv.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
    animation: fadeIn 0.5s ease;
  `;

  addCourseDiv.innerHTML = `
    <button class="add-new-course-btn" style="
      background: linear-gradient(-120deg, rgba(143, 201, 251, 0.301), 20%, #1976d2);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 15px 30px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      width: 97%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s ease;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      Add New Course
    </button>
  `;

  return addCourseDiv;
}

// FIXED: Setup add course button - Redirect to addcourse.html
function setupAddCourseButton() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.add-new-course-btn')) {
      window.location.href = 'addcourse.html';
    }
  });
}
function handleBecomeTeacherClick() {
  const storedCurrentUser = localStorage.getItem("currentUser");

  if (!storedCurrentUser) {
    console.warn("No user logged in");
    return;
  }

  const currentUser = JSON.parse(storedCurrentUser);

  // Load the latest users array
  const allUsers = fromLocalStorage() || users;

  // Find the fresh user by ID
  const freshUser = allUsers.find(u => u.id === currentUser.id);

  if (!freshUser) {
    console.error("User not found in database");
    return;
  }

  // Check teacherProfile properly
  if (freshUser.teacherProfile) {
    // User is a teacher
    window.location.href = "/html/teach.html";
  } else {
    // User is not yet a teacher
    window.location.href = "/pages/teacherrequest.html";
  }
}



document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".teachnav").addEventListener("click", (e) => {
    e.preventDefault();
    handleBecomeTeacherClick();
  });
});
let chatLabels = document.getElementsByClassName("chat");

for (let chatLabel of chatLabels) {
  chatLabel.addEventListener('click', () => {
    window.location.href = "/html/teacherProgress.html";
  });
}
