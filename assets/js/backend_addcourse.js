// assets/js/backend_addcourse.js
export function handleCourseSubmission() {
    // 1. Get form values
    const courseName = document.querySelector("#courseName").value.trim();
    const timeToComplete = document.querySelector("#timeToComplete").value.trim();
    const price = document.querySelector("#price").value.trim().replace('$','');
    const description = document.querySelector("#description").value.trim();
    const categoryText = document.querySelector('.select-txt').textContent.trim();

    const videosList = document.querySelector("#vdFiles").files;
    const assignmentFiles = document.querySelector("#assignment").files;

    // 2. Validation
    if (!courseName || !timeToComplete || !price || !description || categoryText === "select a category") {
        alert("Please fill all required fields and select a category.");
        return;
    }

    if (isNaN(timeToComplete) || timeToComplete <= 0) {
        alert("Duration must be a positive number.");
        return;
    }

    if (isNaN(price) || price < 0) {
        alert("Price must be a valid number.");
        return;
    }

    // 3. Loading state
    const submitBtn = document.querySelector("#submit");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating course...";

    // 4. FormData
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

    // 6. Add assignment files
    for (let i = 0; i < assignmentFiles.length; i++) {
        formData.append('assignments[]', assignmentFiles[i]);
    }

    // 7. Send to backend
    fetch('/api/create_course.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('new_course', JSON.stringify({
                id: data.course_id,
                title: courseName,
                category: categoryText,
                created_at: new Date().toLocaleString()
            }));
            window.location.href = "teach.html";
        } else {
            alert(`Error: ${data.error || 'Unknown error'}`);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    })
    .catch(err => {
        alert(`Network error: ${err.message}`);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// --- Add this at the end to bind the click ---
document.getElementById('submit').addEventListener('click', handleCourseSubmission);
