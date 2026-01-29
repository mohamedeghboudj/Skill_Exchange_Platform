// In teach.js, update the DOMContentLoaded event and renderAllCourses:

document.addEventListener('DOMContentLoaded', async () => {
  setupPreExistingCourses();
  await renderAllCourses(); // Add await
  setupAddCourseButton();
});

// Update renderAllCourses to be async
async function renderAllCourses() {
  const contentDiv = document.querySelector('.content');
  
  try {
    const courses = await getCourses(); // Now async
    
    courses.forEach(course => {
      const courseElement = createCourseElement(course);
      contentDiv.appendChild(courseElement);
    });
    
    // Add the "Add New Course" button at the end
    if (!document.querySelector('.add-course-container')) {
      const addCourseDiv = createAddCourseButton();
      contentDiv.appendChild(addCourseDiv);
    }
  } catch (error) {
    console.error('Failed to load courses:', error);
    // Show error message to user
    contentDiv.innerHTML = '<p style="color: red; text-align: center;">Failed to load courses. Please refresh the page.</p>';
  }
}