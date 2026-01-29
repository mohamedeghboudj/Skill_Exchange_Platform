// assets/js/backend_addcourse.js - Backend Handler
export function handleCourseSubmission() {
    // 1. Get all form values
    const courseName = document.querySelector("#courseName").value;
    const timeToComplete = document.querySelector("#timeToComplete").value;
    const price = document.querySelector("#price").value;
    const description = document.querySelector("#description").value;
    const categoryText = document.querySelector('.select-txt').textContent;
    const videosList = document.querySelector("#vdFiles").files;
    const assignmentFile = document.querySelector("#assignment").files[0];

    // 2. Validate category (double-check)
    if (categoryText === "select a category" || categoryText.trim() === "") {
        alert("Please select a category");
        return;
    }

    // 3. Show loading state
    const submitBtn = document.querySelector("#submit");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating course...';

    // 4. Create FormData object
    const formData = new FormData();
    formData.append('course_title', courseName);
    formData.append('duration', timeToComplete);
    formData.append('price', price);
    formData.append('course_description', description);
    formData.append('category', categoryText);
    
    // 5. Add video files
    for (let i = 0; i < videosList.length; i++) {
        formData.append('videos[]', videosList[i]);
    }
    
    // 6. Add assignment file (if exists)
    if (assignmentFile) {
        formData.append('assignments[]', assignmentFile);
    }
    
    // 7. Send to backend API
    fetch('../api/create_course.php', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Important for sessions
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store course info for next page
            sessionStorage.setItem('new_course', JSON.stringify({
                id: data.course_id,
                title: courseName,
                category: categoryText,
                created_at: new Date().toLocaleString()
            }));
            
            // Redirect to teach page
            window.location.href = "teach.html";
        } else {
            alert(` Error: ${data.error || 'Unknown error'}`);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    })
    .catch(error => {
        alert(` Network error: ${error.message}`);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}